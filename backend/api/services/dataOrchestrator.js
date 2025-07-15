const db = require('../config/database');

function processGame(game, chessComId) {
  if (!game.rated || !['rapid', 'blitz'].includes(game.time_class) || !game.end_time) {
    return null;
  }
  let playerRating = null;
  if (game.white.username?.toLowerCase() === chessComId) playerRating = game.white.rating;
  else if (game.black.username?.toLowerCase() === chessComId) playerRating = game.black.rating;
  if (playerRating === null) return null;
  const endDate = new Date(game.end_time * 1000);
  return {
    game_link: game.url,
    rating: playerRating,
    date: endDate.toISOString().split('T')[0],
    time: endDate.toTimeString().split(' ')[0],
    time_class: game.time_class,
  };
}

exports.runDataUpdateCycle = async () => {
  console.log('--- orchestrator: Starting new player data update cycle ---');
  const fetch = (await import('node-fetch')).default;

  try {
    const playersResult = await db.query(`
      SELECT "Chess_com_ID", "rapid_graph", "blitz_graph", "No_of_games_fetched" FROM players
      WHERE "Chess_com_ID" IS NOT NULL AND "Chess_com_ID" != ''
    `);

    for (const player of playersResult.rows) {
      const chessComId = player.Chess_com_ID.toLowerCase();
      console.log(`- orchestrator: Processing player ${chessComId}...`);
      
      const dbMeta = player.No_of_games_fetched || {};
      let fetchAll = false;

      if (!dbMeta.rapid_count && !dbMeta.blitz_count) {
        console.log(`- orchestrator: First time fetch for ${chessComId}. Getting all archives.`);
        fetchAll = true;
      } else {
        const statsRes = await fetch(`https://api.chess.com/pub/player/${chessComId}/stats`);
        if (!statsRes.ok) {
          console.warn(`! orchestrator: Could not fetch stats for ${chessComId}. Skipping.`);
          continue;
        }
        const statsData = await statsRes.json();
        const rapidRecord = statsData?.chess_rapid?.record;
        const blitzRecord = statsData?.chess_blitz?.record;
        const apiRapidCount = (rapidRecord?.win || 0) + (rapidRecord?.loss || 0) + (rapidRecord?.draw || 0);
        const apiBlitzCount = (blitzRecord?.win || 0) + (blitzRecord?.loss || 0) + (blitzRecord?.draw || 0);

        if (apiRapidCount === (dbMeta.rapid_count || 0) && apiBlitzCount === (dbMeta.blitz_count || 0)) {
          console.log(`- orchestrator: No new games for ${chessComId}. Player is up to date.`);
          continue;
        }
        console.log(`- orchestrator: New games detected for ${chessComId}. Fetching recent archives.`);
      }

      const archivesRes = await fetch(`https://api.chess.com/pub/player/${chessComId}/games/archives`);
      if (!archivesRes.ok) {
        console.warn(`! orchestrator: Could not fetch archives list for ${chessComId}. Skipping.`);
        continue;
      }
      const archivesData = await archivesRes.json();
      const archiveUrls = fetchAll ? archivesData.archives : archivesData.archives.slice(-2);

      let gamesToFetch = [];
      for (const url of archiveUrls) {
        try {
            const gamesRes = await fetch(url);
            if (!gamesRes.ok) continue;
            const monthlyData = await gamesRes.json();
            for (const game of monthlyData.games) {
              const processed = processGame(game, chessComId);
              if (processed) gamesToFetch.push(processed);
            }
        } catch (fetchErr) {
            console.error(`❌ orchestrator: Error fetching or processing archive ${url}:`, fetchErr.message);
        }
      }

      if (gamesToFetch.length === 0 && !fetchAll) continue;

      const rapidMap = new Map((player.rapid_graph || []).map(g => [g.game_link, g]));
      const blitzMap = new Map((player.blitz_graph || []).map(g => [g.game_link, g]));

      for (const game of gamesToFetch) {
        const simpleGame = { game_link: game.game_link, rating: game.rating, date: game.date, time: game.time };
        if (game.time_class === 'rapid') rapidMap.set(game.game_link, simpleGame);
        else if (game.time_class === 'blitz') blitzMap.set(game.game_link, simpleGame);
      }
      
      const finalRapidGraph = Array.from(rapidMap.values()).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
      const finalBlitzGraph = Array.from(blitzMap.values()).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

      const newMeta = {
        rapid_count: finalRapidGraph.length,
        blitz_count: finalBlitzGraph.length,
        last_updated: new Date().toISOString(),
      };

      await db.query(`
        UPDATE players SET
          rapid_graph = $1::jsonb,
          blitz_graph = $2::jsonb,
          "No_of_games_fetched" = $3::jsonb
        WHERE "Chess_com_ID" = $4
      `, [
        JSON.stringify(finalRapidGraph),
        JSON.stringify(finalBlitzGraph),
        JSON.stringify(newMeta),
        player.Chess_com_ID
      ]);

      console.log(`✅ orchestrator: Successfully updated graphs and metadata for ${chessComId}.`);
    }

    console.log('--- orchestrator: Player data update cycle complete ---');
  } catch (error) {
    console.error('❌ orchestrator: A fatal error occurred during the update cycle:', error);
  }
};
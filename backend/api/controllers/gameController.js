// backend/api/controllers/gameController.js

const db = require('../config/database');

/**
 * Fetches all tracked player Chess.com IDs from the database.
 */
const getOurPlayers = async (req, res) => {
  const query = `SELECT "Chess_com_ID" FROM players WHERE "Chess_com_ID" IS NOT NULL AND "Chess_com_ID" != ''`;
  try {
    const result = await db.query(query);
    const playerIds = result.rows.map(row => row.Chess_com_ID);
    res.json({ success: true, players: playerIds });
  } catch (err) {
    console.error("Error fetching our players:", err.message);
    res.status(500).json({ success: false, message: "Database error." });
  }
};

/**
 * Fetches all games from the database for a specific date.
 */
const getGamesByDate = async (req, res) => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ success: false, message: "Invalid date format. Please use YYYY-MM-DD." });
  }
  const query = `SELECT link, date, white_player, black_player, result, pgn_moves FROM player_games WHERE date = $1 ORDER BY link DESC`;
  try {
    const result = await db.query(query, [date]);
    res.json({ success: true, games: result.rows });
  } catch (err) {
    console.error(`Error fetching games for date ${date}:`, err.message);
    res.status(500).json({ success: false, message: "Database error while fetching games." });
  }
};

/**
 * Fetches a single game by its unique link.
 */
const getGameByLink = async (req, res) => {
  const { link } = req.params;
  if (!link) {
    return res.status(400).json({ success: false, message: "Game link is required." });
  }
  const query = `SELECT link, date, white_player, black_player, result, pgn_moves FROM player_games WHERE link = $1`;
  try {
    const result = await db.query(query, [link]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Game not found in the database." });
    }
    res.json({ success: true, game: result.rows[0] });
  } catch (err) {
    console.error('[DB Error] Database query failed:', err.message);
    return res.status(500).json({ success: false, message: "Database error." });
  }
};

module.exports = {
  getOurPlayers,
  getGamesByDate,
  getGameByLink,
};
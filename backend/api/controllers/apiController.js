const db = require('../config/database');

/**
 * Fetches all player data needed for the frontend reports.
 */
exports.getPlayerReports = async (req, res) => {
  try {
    // --- FIX: Added "Joining_Date" and "Attendance" to the query ---
    const query = `
      SELECT "Chess_com_ID", "Player_Name", "Joining_Date", "Attendance", "rapid_graph", "blitz_graph" 
      FROM players
      WHERE "Chess_com_ID" IS NOT NULL AND "Chess_com_ID" != ''
      ORDER BY "Player_Name" ASC
    `;
    const { rows } = await db.query(query);
    res.json({ players: rows });
  } catch (error) {
    console.error('Error fetching player reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
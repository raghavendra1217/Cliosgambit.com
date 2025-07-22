const db = require('../config/database');

/**
 * Fetches all player data needed for the frontend reports.
 */
exports.getPlayerReports = async (req, res) => {
  try {
    // First, let's check what columns exist in the players table
    const columnCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'players'
    `);
    
    console.log('Available columns:', columnCheck.rows.map(r => r.column_name));
    
    // Check if Attendance column exists
    const hasAttendance = columnCheck.rows.some(r => r.column_name === 'Attendance');
    console.log('Has Attendance column:', hasAttendance);
    
    // Build query based on available columns
    let query;
    if (hasAttendance) {
      query = `
        SELECT "Chess_com_ID", "Player_Name", "Joining_Date", "Attendance", "activity_tracker", "rapid_graph", "blitz_graph" 
        FROM players
        WHERE "Chess_com_ID" IS NOT NULL AND "Chess_com_ID" != ''
        ORDER BY "Player_Name" ASC
      `;
    } else {
      // If no Attendance column, create an empty one
      query = `
        SELECT "Chess_com_ID", "Player_Name", "Joining_Date", '{}'::jsonb as "Attendance", "activity_tracker", "rapid_graph", "blitz_graph" 
        FROM players
        WHERE "Chess_com_ID" IS NOT NULL AND "Chess_com_ID" != ''
        ORDER BY "Player_Name" ASC
      `;
    }
    
    const { rows } = await db.query(query);
    
    // Debug: Log what we're getting from database
    console.log('Raw database response for first player:', rows[0] ? {
      Player_Name: rows[0].Player_Name,
      Attendance: rows[0].Attendance,
      AttendanceType: typeof rows[0].Attendance
    } : 'No players found');
    
    // Parse Attendance if needed - PostgreSQL returns JSONB as object, but let's be safe
    rows.forEach(row => {
      if (row.Attendance === null || row.Attendance === undefined) {
        row.Attendance = {};
      } else if (typeof row.Attendance === 'string') {
        try { 
          row.Attendance = JSON.parse(row.Attendance); 
        } catch (e) {
          console.error('Failed to parse Attendance string:', row.Attendance);
          row.Attendance = {};
        }
      }
      // If it's already an object (JSONB), keep it as is
    });
    
    // Debug: Log processed data
    console.log('Processed first player Attendance:', rows[0] ? {
      Player_Name: rows[0].Player_Name,
      Attendance: rows[0].Attendance,
      AttendanceKeys: Object.keys(rows[0].Attendance || {})
    } : 'No players found');
    
    res.json({ players: rows });
  } catch (error) {
    console.error('Error fetching player reports:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

exports.updatePlayerAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { Attendance } = req.body;
    if (!id || !Attendance) {
      return res.status(400).json({ error: 'Missing id or Attendance' });
    }
    
    // Debug: Log what we're saving
    console.log('Saving attendance for player:', id, 'Data:', Attendance);
    console.log('Attendance type:', typeof Attendance);
    console.log('Attendance keys:', Object.keys(Attendance));
    
    // Ensure Attendance is properly formatted as JSONB
    const attendanceData = typeof Attendance === 'string' ? JSON.parse(Attendance) : Attendance;
    
    await db.query(
      'UPDATE players SET "Attendance" = $1::jsonb WHERE "Chess_com_ID" = $2',
      [JSON.stringify(attendanceData), id]
    );
    
    console.log('Successfully updated attendance for player:', id);
    res.json({ message: 'Attendance updated', id });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
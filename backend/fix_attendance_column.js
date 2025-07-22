// Script to add Attendance column to players table if it doesn't exist
const db = require('./api/config/database');

async function fixAttendanceColumn() {
  try {
    console.log('Checking if Attendance column exists...');
    
    // Check if the column exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'players' AND column_name = 'Attendance'
    `;
    
    const checkResult = await db.query(checkQuery);
    
    if (checkResult.rows.length === 0) {
      console.log('Attendance column does not exist. Adding it...');
      
      // Add the column
      const addColumnQuery = `
        ALTER TABLE players 
        ADD COLUMN "Attendance" JSONB DEFAULT '{}'::jsonb
      `;
      
      await db.query(addColumnQuery);
      console.log('✅ Successfully added Attendance column to players table');
    } else {
      console.log('✅ Attendance column already exists');
    }
    
    // Test the players report endpoint
    console.log('Testing players report...');
    const testQuery = `
      SELECT "Chess_com_ID", "Player_Name", "Joining_Date", "Attendance", "rapid_graph", "blitz_graph" 
      FROM players
      WHERE "Chess_com_ID" IS NOT NULL AND "Chess_com_ID" != ''
      ORDER BY "Player_Name" ASC
      LIMIT 1
    `;
    
    const testResult = await db.query(testQuery);
    console.log('✅ Players report test successful:', testResult.rows.length > 0 ? 'Found players' : 'No players found');
    
    console.log('Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

fixAttendanceColumn(); 
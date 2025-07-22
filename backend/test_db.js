// Test database connection and table structure
const db = require('./api/config/database');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connection successful:', result.rows[0]);
    
    // Check if players table exists
    const tableCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'players'
    `);
    console.log('✅ Players table exists:', tableCheck.rows.length > 0);
    
    // Check table structure
    const columns = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'players'
      ORDER BY column_name
    `);
    console.log('📋 Players table columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Try to get one player record
    const player = await db.query('SELECT * FROM players LIMIT 1');
    console.log('👤 Sample player data:', player.rows[0] ? {
      Player_Name: player.rows[0].Player_Name,
      Chess_com_ID: player.rows[0].Chess_com_ID,
      hasAttendance: 'Attendance' in player.rows[0],
      AttendanceType: player.rows[0].Attendance ? typeof player.rows[0].Attendance : 'undefined'
    } : 'No players found');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testDatabase(); 
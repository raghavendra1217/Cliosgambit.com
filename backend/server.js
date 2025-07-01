// backend/server.js

// --- 1. IMPORTS ---
const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');

// Application-specific modules
const courseRoutes = require('./api/routes/courseRoutes');
const gameRoutes = require('./api/routes/gameRoutes');
// const { runFetchCycle } = require('./api/services/gameFetcher'); // Temporarily disabled
const { killProcessOnPort } = require('./api/utils/portKiller');
const db = require('./api/config/database');

// --- 2. CONFIGURATION & INITIALIZATION ---
const PORT = process.env.PORT || 10000;
const app = express();
const frontendBuildPath = path.join(__dirname, '../frontend/build');

// --- 3. CORE MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(frontendBuildPath));

// --- 4. API ROUTES ---
app.use('/api', courseRoutes);
app.use('/api', gameRoutes);

// --- 5. FRONTEND FALLBACK ---
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    const indexPath = path.join(frontendBuildPath, 'index.html');
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend not found. Please build the frontend project.');
    }
  } else {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
  }
});

// --- 6. MAIN SERVER STARTUP LOGIC ---
const startServerAndServices = async () => {
  try {
    // Test the database connection
    console.log('Attempting to connect to the database...');
    await db.query('SELECT NOW()'); // A simple query to test the connection
    console.log('✅ Database connection successful.');

    // Start recurring tasks (Temporarily disabled)
    // console.log('Triggering initial game fetch cycle...');
    // runFetchCycle();
    // const fetchIntervalHours = 1;
    // setInterval(runFetchCycle, fetchIntervalHours * 60 * 60 * 1000);
    // console.log(`✅ Game fetch service scheduled to run every ${fetchIntervalHours} hour(s).`);

  } catch (error) {
    console.error('❌ FATAL: Failed to connect to the database or initialize services:', error.message);
    process.exit(1);
  }

  // Start the server listener
  app.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`🚀 Server is live at http://localhost:${PORT}`);
    console.log('-------------------------------------------');

    const openCommand = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${openCommand} http://localhost:${PORT}`);
  });
};

// --- 7. SCRIPT EXECUTION ---
console.log('--- SERVER STARTUP SEQUENCE ---');
killProcessOnPort(PORT)
  .then(startServerAndServices)
  .catch(err => {
      console.error('❌ A fatal error occurred during the startup sequence:', err);
      process.exit(1);
  });
const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const db = require('./api/config/database');
const { killProcessOnPort } = require('./api/utils/portKiller');

// --- Import Route Handlers ---
const courseRoutes = require('./api/routes/courseRoutes');
const playerReportRoutes = require('./api/routes/apiRoutes');

// --- Import Background Service ---
const { runDataUpdateCycle } = require('./api/services/dataOrchestrator');

// --- Configuration ---
const PORT = process.env.PORT || 10000;
const app = express();
const frontendBuildPath = path.join(__dirname, '../frontend/build');

// --- Core Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(frontendBuildPath));

// --- API Routes ---
app.use('/api', courseRoutes); // Your existing course routes
app.use('/api', playerReportRoutes); // The new, clean player report route

// --- Frontend Fallback Route ---
app.get('*', (req, res) => {
  const indexPath = path.join(frontendBuildPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('<h1>Frontend Not Found</h1><p>Please run <strong>npm run build</strong> in the /frontend directory.</p>');
  }
});

// --- Server Startup Logic ---
const startServerAndServices = async () => {
  try {
    console.log('Attempting to connect to the database...');
    await db.query('SELECT NOW()');
    console.log('✅ Database connection successful.');

    console.log('Triggering initial data orchestration cycle...');
    runDataUpdateCycle();

    const updateIntervalHours = 4;
    setInterval(runDataUpdateCycle, updateIntervalHours * 60 * 60 * 1000);
    console.log(`✅ Data orchestration service scheduled every ${updateIntervalHours} hours.`);

  } catch (error) {
    console.error('❌ FATAL: Failed to connect to the database or start services:', error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server is live at http://localhost:${PORT}`);
    const openCommand = process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${openCommand} http://localhost:${PORT}`);
  });
};

// --- Main Execution ---
killProcessOnPort(PORT).then(startServerAndServices).catch(err => {
    console.error('❌ A fatal error occurred during the startup sequence:', err);
    process.exit(1);
});
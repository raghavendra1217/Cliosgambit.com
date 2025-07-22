const express = require('express');
const router = express.Router();
const trackerController = require('../controllers/trackerController');

// Update activity_tracker for a player
router.put('/api/tracker/:id', trackerController.updateActivityTracker);

module.exports = router; 
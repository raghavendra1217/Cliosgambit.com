const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// A single, clean endpoint to get all data for the frontend reports.
router.get('/players/reports', apiController.getPlayerReports);

module.exports = router;
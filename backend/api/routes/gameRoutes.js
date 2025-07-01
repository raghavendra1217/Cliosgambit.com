const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// --- Game Data Routes ---
// Endpoints for retrieving specific, analyzed games from the database.

// Get all games for a specific date
router.get('/games/by-date/:date', gameController.getGamesByDate);

// Get a single game's full data by its unique chess.com link
router.get('/game/:link', gameController.getGameByLink);

module.exports = router;
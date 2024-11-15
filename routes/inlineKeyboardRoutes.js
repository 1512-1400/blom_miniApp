const express = require('express');
const router = express.Router();
const inlineKeyboardController = require('../controllers/inlineKeyboard'); 


router.post('/inlineKeyboard', inlineKeyboardController.postinlineKeyboardAnswer);

module.exports = router;

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin'); 

router.get(`/Dr_blom`, adminController.getDr_blom)

router.post(`/answer`, adminController.postAnswer)

module.exports = router;
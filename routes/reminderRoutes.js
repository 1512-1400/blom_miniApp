const express = require('express');
const router = express.Router();
const ReminderController = require('../controllers/reminder'); // اطمینان حاصل کنید که کنترلر درست وارد شده است


router.get('/remider', ReminderController.getremider);  // اطمینان حاصل کنید که تابع checkReminders موجود است

router.get('/dr_blom', ReminderController.getDr_blom);  // اطمینان حاصل کنید که تابع checkReminders موجود است

module.exports = router;

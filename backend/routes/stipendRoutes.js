const express = require('express');
const { createStipendReport, getCompanyStipends } = require('../controllers/stipendController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/company/:companyId', protect, authorize('student'), createStipendReport);
router.get('/company/:companyId', getCompanyStipends);

module.exports = router;

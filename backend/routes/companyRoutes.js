const express = require('express');
const { 
    submitCompanyProfile, 
    verifyCompany, 
    getAllCompanies, 
    deleteCompany 
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Feature 1: HR submits profile (Status: Pending)
router.post('/submit', protect, authorize('company'), submitCompanyProfile);

// Feature 1 & 2: Admin verifies company (Approve/Reject)
router.put('/verify/:id', protect, authorize('admin'), verifyCompany);

// Feature 2: Admin gets all companies list
router.get('/all', protect, authorize('admin'), getAllCompanies);

// Feature 2: Admin deletes a fake/rejected company
router.delete('/:id', protect, authorize('admin'), deleteCompany);

module.exports = router;

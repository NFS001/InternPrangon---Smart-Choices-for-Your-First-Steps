const express = require('express');
const { 
    submitCompanyProfile, 
    verifyCompany, 
    getAllCompanies, 
    addCompanyByAdmin,
    deleteCompany,
    getCompanyDirectory,
    getMyCompanyProfile
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Feature 13: Public Company Directory
router.get('/directory', getCompanyDirectory);

// Feature 3: HR gets their company profile
router.get('/profile', protect, authorize('company'), getMyCompanyProfile);

// Feature 1: HR submits profile (Status: Pending)
router.post('/submit', protect, authorize('company'), submitCompanyProfile);

// Feature 1 & 2: Admin verifies company (Approve/Reject)
router.put('/verify/:id', protect, authorize('admin'), verifyCompany);

// Feature 2: Admin gets all companies list
router.get('/all', protect, authorize('admin'), getAllCompanies);

// Admin adds a company directly
router.post('/admin-add', protect, authorize('admin'), addCompanyByAdmin);

// Feature 2: Admin deletes a fake/rejected company
router.delete('/:id', protect, authorize('admin'), deleteCompany);

module.exports = router;

const express = require('express');
const { 
    submitCompanyProfile, 
    verifyCompany, 
    getAllCompanies, 
    deleteCompany 
} = require('../controllers/companyController');

const router = express.Router();

// Feature 1: HR submits profile (Status: Pending)
router.post('/submit', submitCompanyProfile);

// Feature 1 & 2: Admin verifies company (Approve/Reject)
router.put('/verify/:id', verifyCompany);

// Feature 2: Admin gets all companies list
router.get('/all', getAllCompanies);

// Feature 2: Admin deletes a fake/rejected company
router.delete('/:id', deleteCompany);

module.exports = router;
const express = require('express');
const {
    applyToInternship,
    getApplicantsForInternship,
    downloadApplicantResume,
    updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { requireApprovedCompany } = require('../middleware/companyVerificationMiddleware');

const router = express.Router();

router.post('/:internshipId', protect, authorize('student'), applyToInternship);
router.get(
    '/internship/:internshipId',
    protect,
    authorize('company'),
    requireApprovedCompany,
    getApplicantsForInternship
);
router.get(
    '/:applicationId/resume',
    protect,
    authorize('company'),
    requireApprovedCompany,
    downloadApplicantResume
);
router.patch(
    '/:applicationId/status',
    protect,
    authorize('company'),
    requireApprovedCompany,
    updateApplicationStatus
);

module.exports = router;

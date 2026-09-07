const express = require('express');
const {
    applyToInternship,
    getApplicantsForInternship,
    downloadApplicantResume,
    updateApplicationStatus,
    getMyApplications,
    getAllCompanyApplicants
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { requireApprovedCompany } = require('../middleware/companyVerificationMiddleware');

const router = express.Router();

router.get('/company/all', protect, authorize('company'), requireApprovedCompany, getAllCompanyApplicants);
router.get('/my-applications', protect, authorize('student'), getMyApplications);
router.get('/my', protect, authorize('student'), getMyApplications);
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

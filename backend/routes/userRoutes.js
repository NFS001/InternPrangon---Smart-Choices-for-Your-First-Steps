const express = require('express');
const { registerUser, loginUser, getCurrentUser } = require('../controllers/userController'); // loginUser add kora hoyeche
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route: http://localhost:5000/api/users/register
router.post('/register', registerUser);

// Route: http://localhost:5000/api/users/login
router.post('/login', loginUser); // notun route

// Route: http://localhost:5000/api/users/me
router.get('/me', protect, getCurrentUser);

module.exports = router;

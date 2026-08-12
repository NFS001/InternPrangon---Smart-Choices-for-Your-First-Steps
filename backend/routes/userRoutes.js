const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController'); // loginUser add kora hoyeche

const router = express.Router();

// Route: http://localhost:5000/api/users/register
router.post('/register', registerUser);

// Route: http://localhost:5000/api/users/login
router.post('/login', loginUser); // notun route

module.exports = router;
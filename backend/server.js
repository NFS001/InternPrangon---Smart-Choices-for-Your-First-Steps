const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Route files
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const studentRoutes = require('./routes/studentRoutes');
const internshipRoutes = require('./routes/internshipRoutes'); // Internship Route Import
const resumeRoutes = require('./routes/resumeRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Apply routes
app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/internship', internshipRoutes); // Internship Route Apply
app.use('/api/resume', resumeRoutes);

app.get('/', (req, res) => {
    res.send('InternPrangon API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

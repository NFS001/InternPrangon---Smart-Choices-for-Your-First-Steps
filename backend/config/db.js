const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully!');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        console.warn('Backend server is running, but database operations will be unavailable until MongoDB connects.');
    }
};

module.exports = connectDB;

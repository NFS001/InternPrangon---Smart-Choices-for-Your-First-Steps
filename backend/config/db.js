const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected || mongoose.connection.readyState === 1) {
        return;
    }

    if (!process.env.MONGO_URI) {
        console.warn('MONGO_URI is not set. Database operations will not succeed until it is provided.');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        isConnected = db.connections[0].readyState === 1;
        console.log('MongoDB Connected Successfully!');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        console.warn('Backend server is running, but database operations will be unavailable until MongoDB connects.');
    }
};

module.exports = connectDB;


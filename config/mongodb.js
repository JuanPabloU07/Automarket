const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connection');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1); 
    }
};

module.exports = connectMongo;
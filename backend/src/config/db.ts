import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || '';
        if (!uri) {
            console.warn('MONGO_URI not set. Starting server without database connection.');
            return false;
        }

        await mongoose.connect(uri);
        console.log('MongoDB connected');
        return true;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.warn('Continuing without database connection. Some API features may not work.');
        return false;
    }
};

export { connectDB };

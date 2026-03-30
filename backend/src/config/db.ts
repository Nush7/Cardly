import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || '';
        if (!uri) throw new Error('MONGO_URI not set');
        await mongoose.connect(uri);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

export { connectDB };

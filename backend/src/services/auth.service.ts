import User from '../models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signupService = async (email: string, password: string) => {
    if (!email || !password) return { error: 'missing_fields' };
    const existing = await User.findOne({ email });
    if (existing) return { error: 'email_in_use' };
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, passwordHash });
    return { message: 'User created' };
};

export const loginService = async (email: string, password: string) => {
    const user = await User.findOne({ email });
    if (!user) return { error: 'invalid_credentials' };
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return { error: 'invalid_credentials' };
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
    );
    return { token };
};

export const getMeService = async (userId: string) => {
    const user = await User.findById(userId).select('-passwordHash');
    return user;
};

import { Request, Response, NextFunction } from 'express';

import { signupService, loginService, getMeService } from '../services/auth.service';

const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const result = await signupService(email, password);
        if (result.error === 'missing_fields') return res.status(400).json({ message: 'Email and password required' });
        if (result.error === 'email_in_use') return res.status(409).json({ message: 'Email already in use' });
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        next(err);
    }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const result = await loginService(email, password);
        if (result.error === 'invalid_credentials') return res.status(401).json({ message: 'Invalid credentials' });
        res.json({ token: result.token });
    } catch (err) {
        next(err);
    }
};

const getMe = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
        const user = await getMeService(req.user.userId);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export { signup, login, getMe };

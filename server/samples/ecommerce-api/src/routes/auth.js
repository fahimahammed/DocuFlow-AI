import { Router } from 'express';

export const authRouter = Router();

// POST /api/v1/auth/register
authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    res.status(201).json({ success: true, message: 'User registered', token: 'jwt_mock_token' });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    res.json({ success: true, token: 'jwt_mock_session', user: { email, role: 'customer' } });
  } catch (err) {
    next(err);
  }
});


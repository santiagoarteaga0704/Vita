import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../services/supabase.js';
import { hashPassword, verifyPassword, signToken } from '../services/auth.js';
import { AppError } from '../middleware/errors.js';
import { authJwt } from '../middleware/authJwt.js';

export const authRouter = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  region: z.string().min(2),
  crop_main: z.string().min(2),
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const body = RegisterSchema.parse(req.body);
    const password_hash = await hashPassword(body.password);

    const { data, error } = await supabase()
      .from('users')
      .insert({
        email: body.email,
        password_hash,
        name: body.name,
        region: body.region,
        crop_main: body.crop_main,
      })
      .select('id, email, name, region, crop_main')
      .single();

    if (error) {
      if (error.code === '23505') throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered');
      throw error;
    }

    const token = signToken({ userId: data.id, email: data.email });
    res.status(201).json({ data: { user: data, token } });
  } catch (e) { next(e); }
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = LoginSchema.parse(req.body);
    const { data: user, error } = await supabase()
      .from('users')
      .select('id, email, password_hash, name, region, crop_main, premium')
      .eq('email', body.email)
      .single();

    if (error || !user) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    if (!(await verifyPassword(body.password, user.password_hash))) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const { password_hash, ...safe } = user;
    const token = signToken({ userId: user.id, email: user.email });
    res.json({ data: { user: safe, token } });
  } catch (e) { next(e); }
});

authRouter.get('/me', authJwt, async (req, res, next) => {
  try {
    const { data, error } = await supabase()
      .from('users')
      .select('id, email, name, region, crop_main, premium, scans_count_month')
      .eq('id', req.user!.userId)
      .single();
    if (error || !data) throw new AppError(404, 'NOT_FOUND', 'User not found');
    res.json({ data: { user: data } });
  } catch (e) { next(e); }
});

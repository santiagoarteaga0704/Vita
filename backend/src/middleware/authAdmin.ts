import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase.js';
import { AppError } from './errors.js';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminUser;
    }
  }
}

export async function authAdmin(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'NO_TOKEN', 'Missing bearer token'));
  }
  const token = header.slice(7);
  const { data, error } = await supabase().auth.getUser(token);
  if (error || !data.user?.email) {
    return next(new AppError(401, 'INVALID_TOKEN', 'Invalid supabase token'));
  }
  const { data: admin } = await supabase()
    .from('admin_users')
    .select('id, email, role')
    .eq('email', data.user.email)
    .single();
  if (!admin) return next(new AppError(403, 'NOT_ADMIN', 'Not an admin user'));
  req.admin = admin as AdminUser;
  next();
}

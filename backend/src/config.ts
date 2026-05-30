import 'dotenv/config';
import { z } from 'zod';

const ConfigSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_KEY: z.string().min(20),

  GEMINI_API_KEY: z.string().min(20),

  JWT_SECRET: z.string().min(20),
  JWT_EXPIRES_IN: z.string().default('30d'),

  WEB_ADMIN_URL: z.string().optional(),

  FCM_PROJECT_ID: z.string().optional(),
  FCM_PRIVATE_KEY: z.string().optional(),
  FCM_CLIENT_EMAIL: z.string().optional(),
});

const parsed = ConfigSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;

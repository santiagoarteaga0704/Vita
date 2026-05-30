import { supabase } from './supabase.js';
import { v4 as uuid } from 'uuid';

const BUCKET = 'scan-images';

export async function uploadScanImage(userId: string, buffer: Buffer): Promise<string> {
  const path = `${userId}/${uuid()}.jpg`;
  const { error } = await supabase()
    .storage.from(BUCKET)
    .upload(path, buffer, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  return path;
}

export async function getSignedUrl(path: string, expiresSec = 3600): Promise<string> {
  const { data, error } = await supabase()
    .storage.from(BUCKET)
    .createSignedUrl(path, expiresSec);
  if (error) throw error;
  return data.signedUrl;
}

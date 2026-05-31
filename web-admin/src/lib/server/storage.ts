/**
 * Storage local de imágenes de scan en el filesystem.
 *
 * Las imágenes se guardan bajo `web-admin/storage/scan-images/<userId>/<uuid>.jpg`
 * y se sirven desde la ruta pública `/storage/scan-images/<userId>/<uuid>.jpg`
 * mapeada por una route handler que lee el archivo y lo devuelve con el
 * content-type correcto (no usamos `public/` para que cada scan herede los
 * permisos del usuario sin filtrarse).
 *
 * sharp resize sigue igual.
 */
import path from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

const STORAGE_ROOT = path.join(process.cwd(), 'storage', 'scan-images');

export async function resizeImage(buffer: Buffer, maxSide = 1024): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(maxSide, maxSide, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

/** Guarda la imagen en disco y devuelve la ruta relativa (`<userId>/<uuid>.jpg`). */
export async function saveScanImage(userId: string, buffer: Buffer): Promise<string> {
  const userDir = path.join(STORAGE_ROOT, userId);
  await mkdir(userDir, { recursive: true });
  const name = `${randomUUID()}.jpg`;
  await writeFile(path.join(userDir, name), buffer);
  return path.posix.join(userId, name);
}

/** Devuelve la URL pública (servida por /api/storage/...). No expira porque es local. */
export function publicUrl(relativePath: string): string {
  return `/api/storage/scan-images/${relativePath}`;
}

export function absolutePath(relativePath: string): string {
  return path.join(STORAGE_ROOT, relativePath);
}

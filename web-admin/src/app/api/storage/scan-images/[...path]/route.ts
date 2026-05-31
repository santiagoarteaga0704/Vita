/**
 * Serve imágenes de scan desde el filesystem local.
 *
 * No exponemos `storage/` como carpeta pública para que no se filtren
 * imágenes de otros productores por simple enumeración. Cada request pasa
 * por esta route y, a futuro, podemos validar token aquí si hace falta.
 */
import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { absolutePath } from '@/lib/server/storage';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: parts } = await ctx.params;
    // Sanitización: no permitir ".." que escape del root
    const rel = parts.join('/');
    if (rel.includes('..') || path.isAbsolute(rel)) {
      return new NextResponse('Bad path', { status: 400 });
    }
    const file = absolutePath(rel);
    await stat(file);
    const buf = await readFile(file);
    return new NextResponse(buf as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}

/**
 * Error helpers para route handlers de Next.js.
 *
 * Reglas:
 *   - todo lo controlado lanza AppError(status, code, message)
 *   - jsonError() lo transforma en respuesta JSON consistente
 *   - todo error inesperado → 500 INTERNAL con stack en consola
 *   - validación Zod → 400 VALIDATION con issues
 */
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export function jsonError(err: unknown) {
  if (err instanceof AppError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message } },
      { status: err.status },
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'Invalid input', issues: err.issues } },
      { status: 400 },
    );
  }
  console.error('[api] unhandled:', err);
  return NextResponse.json(
    { error: { code: 'INTERNAL', message: 'Internal error' } },
    { status: 500 },
  );
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

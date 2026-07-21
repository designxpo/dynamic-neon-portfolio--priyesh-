import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';

/**
 * Guard for routes that look up a document by a client-supplied id.
 * Returns a 400 response when `id` is missing or not a valid Mongo ObjectId,
 * otherwise null. Without this, passing something like `/api/projects/abc`
 * makes Mongoose throw an uncaught CastError that surfaces as a generic 500.
 *
 *   const bad = badObjectId(params.id); if (bad) return bad;
 */
export function badObjectId(id: string | null | undefined): NextResponse | null {
  if (!id || !isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  return null;
}

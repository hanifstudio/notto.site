import { NextResponse } from "next/server";

import { ApiError } from "./errors";

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; error: { message: string; code: string } };
export type ApiResponseBody<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, code: string, status: number): NextResponse {
  return NextResponse.json({ success: false, error: { message, code } }, { status });
}

/**
 * Expected ApiErrors are returned as-is without logging (normal operational
 * errors). Unknown errors are logged server-side with context and returned as
 * a generic 500 — never leak an unexpected message (stack traces, connection
 * strings) to the client.
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  if (error instanceof ApiError) {
    return fail(error.message, error.code, error.status);
  }

  console.error(`[${context}] Unexpected error:`, error);
  return fail("An unexpected error occurred", "INTERNAL_SERVER_ERROR", 500);
}

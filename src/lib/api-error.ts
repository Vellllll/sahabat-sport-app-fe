// lib/api-error.ts
// Shared helpers for unwrapping errors thrown by fetch-based API calls
// (serverApiFetch throws a plain Error, but some call sites wrap a Response
// with a `.json()` method carrying the backend's structured error payload).

interface ApiErrorPayload {
  message?: string | string[];
}

function hasJsonMethod(error: unknown): error is { json: () => Promise<ApiErrorPayload> } {
  return (
    typeof error === "object" &&
    error !== null &&
    "json" in error &&
    typeof (error as Record<string, unknown>).json === "function"
  );
}

/**
 * Attempts to pull a human-readable message out of a NestJS-style JSON error
 * payload (`{ message: string | string[] }`). Returns null when the error
 * doesn't carry one, so callers can fall back to their own default message.
 */
export async function extractApiErrorMessage(error: unknown): Promise<string | null> {
  if (!hasJsonMethod(error)) return null;

  try {
    const payload = await error.json();
    if (payload?.message) {
      return Array.isArray(payload.message) ? payload.message[0] : payload.message;
    }
  } catch {
    // malformed or empty error body — fall through to null
  }

  return null;
}

/** Narrow an unknown catch-block error down to its message, or a fallback. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** Safely narrow an unknown value to a plain object for property probing. */
export function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

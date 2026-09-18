import "server-only";

import { cookies } from "next/headers";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ServerApiOptions {
  method?: ApiMethod;
  body?: unknown;
  withAuth?: boolean;
  revalidate?: number;
  tags?: string[];
  cache?: RequestCache;
}

const API_URL = process.env.INTERNAL_API_URL;

function getApiUrl() {
  if (!API_URL) {
    throw new Error("INTERNAL_API_URL is not configured");
  }

  return API_URL;
}

export async function serverApiFetch<T>(path: string, options: ServerApiOptions = {}): Promise<T> {
  const { method = "GET", body, withAuth = true, revalidate, tags, cache } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (withAuth) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  // `cache` and `next.revalidate` are mutually exclusive on fetch, so only set one.
  const cachingOptions = cache ? { cache } : { next: { revalidate, tags } };

  const response = await fetch(`${getApiUrl()}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...cachingOptions,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}


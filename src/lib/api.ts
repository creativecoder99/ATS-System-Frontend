/**
 * Thin fetch wrapper around the HireHive API.
 *
 * The access token is held in memory only - never localStorage - so an XSS
 * payload cannot read it off disk. It is restored on page load by calling
 * /auth/refresh, which reads the httpOnly cookie the browser sends for us.
 */
const rawBaseUrl = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
export const BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly details?: { field: string; message: string }[];

  constructor(status: number, message: string, details?: { field: string; message: string }[]) {
    super(message);
    this.status = status;
    this.details = details;
  }

  /** Maps validation errors to a { field: message } object for form display. */
  get fieldErrors(): Record<string, string> {
    return Object.fromEntries((this.details ?? []).map((d) => [d.field, d.message]));
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Set when sending FormData, so the browser writes the multipart boundary. */
  isFormData?: boolean;
  signal?: AbortSignal;
}

/**
 * A single in-flight refresh shared by all callers. Without this, three
 * concurrent 401s would fire three refreshes and the last cookie rotation
 * would invalidate the tokens the other two just received.
 */
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  refreshPromise ??= (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return false;
      const json = await res.json();
      accessToken = json.data.accessToken;
      return true;
    } catch {
      return false;
    } finally {
      // Cleared on the next tick so callers awaiting this promise all see it.
      queueMicrotask(() => {
        refreshPromise = null;
      });
    }
  })();

  return refreshPromise;
}

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { method = 'GET', body, isFormData, signal } = options;

  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    signal,
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  // An expired access token is recoverable: refresh once, then replay the
  // request. isRetry stops this from looping when the refresh itself fails.
  if (res.status === 401 && !isRetry && !path.startsWith('/auth/refresh')) {
    if (await refreshAccessToken()) {
      return request<T>(path, options, true);
    }
    accessToken = null;
  }

  if (res.status === 204) return undefined as T;

  const json = await res.json().catch(() => ({ message: res.statusText }));

  if (!res.ok) {
    throw new ApiRequestError(res.status, json.message ?? 'Request failed', json.details);
  }

  return json as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  postForm: <T>(path: string, body: FormData) =>
    request<T>(path, { method: 'POST', body, isFormData: true }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  refresh: refreshAccessToken,
};

/** Builds a query string, dropping empty values so the URL stays clean. */
export function toQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

import { Platform } from 'react-native';

const fallbackHost =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? fallbackHost;
export const API_PREFIX = '/api/v1';

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiError = {
  success?: false;
  error?: {
    message?: string;
    code?: string;
    details?: unknown;
  };
  message?: string;
};

export class ApiRequestError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.details = details;
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  accessToken?: string | null;
};

async function apiRequest<T>(
  path: string,
  method: string,
  body?: unknown,
  init?: ApiRequestOptions
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
    ...init,
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.accessToken ? { Authorization: `Bearer ${init.accessToken}` } : {}),
      ...init?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiError | null;

  if (!response.ok) {
    const errorPayload = payload as ApiError | null;
    const message = errorPayload?.error?.message || errorPayload?.message || `API request failed: ${response.status}`;
    throw new ApiRequestError(response.status, message, errorPayload?.error?.details);
  }

  return (payload as ApiSuccess<T>).data;
}

export async function apiGet<T>(path: string, init?: ApiRequestOptions): Promise<T> {
  return apiRequest<T>(path, 'GET', undefined, init);
}

export async function apiPost<T, TBody = unknown>(
  path: string,
  body?: TBody,
  init?: ApiRequestOptions
): Promise<T> {
  return apiRequest<T>(path, 'POST', body, init);
}

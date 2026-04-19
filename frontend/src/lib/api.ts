import {
  AuthResponse,
  CreateLeaseInput,
  Lease,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function toErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return 'Request failed';
  }

  const data = payload as { message?: string | string[]; error?: string };
  if (Array.isArray(data.message)) {
    return data.message.join(', ');
  }
  if (typeof data.message === 'string') {
    return data.message;
  }
  if (typeof data.error === 'string') {
    return data.error;
  }

  return 'Request failed';
}

async function request<T>(
  path: string,
  init: RequestInit,
  token?: string,
): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new ApiError(toErrorMessage(data), response.status);
  }

  return data as T;
}

export function registerUser(payload: {
  fullName: string;
  email: string;
  password: string;
}) {
  return request<AuthResponse>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function loginUser(payload: { email: string; password: string }) {
  return request<AuthResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function fetchMyLeases(token: string) {
  return request<Lease[]>(
    '/leases/me',
    {
      method: 'GET',
    },
    token,
  );
}

export function createLease(token: string, payload: CreateLeaseInput) {
  return request<Lease>(
    '/leases',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token,
  );
}

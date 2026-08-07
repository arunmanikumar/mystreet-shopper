import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5197';
const apiRoot = `${apiBaseUrl}/api`;

type AuthApiResponse = {
  token: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
};

function mapAuthResponse(response: AuthApiResponse): AuthResponse {
  return {
    token: response.token,
    user: {
      userId: response.userId,
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email,
      isAdmin: response.isAdmin,
    },
  };
}

async function readApiError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  return body?.message || fallback;
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${apiRoot}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Authentication request failed.'));
  }

  return mapAuthResponse((await response.json()) as AuthApiResponse);
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(`${apiRoot}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Authentication request failed.'));
  }

  return mapAuthResponse((await response.json()) as AuthApiResponse);
}

export async function logout(token: string | null): Promise<void> {
  await fetch(`${apiRoot}/auth/logout`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
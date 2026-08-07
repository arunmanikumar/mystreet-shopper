import { createContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { login as loginRequest, logout as logoutRequest, register as registerRequest } from '../api/authApi';
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../types/auth';
import { clearStoredAuth, getStoredToken, getStoredUser, storeAuth } from '../utils/authStorage';

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (request: LoginRequest) => Promise<AuthResponse>;
  register: (request: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  useEffect(() => {
    if (token && !user) {
      clearStoredAuth();
      setToken(null);
    }
  }, [token, user]);

  const applyAuth = (response: AuthResponse) => {
    setToken(response.token);
    setUser(response.user);
    storeAuth(response.token, response.user);
    return response;
  };

  const handleLogin = async (request: LoginRequest) => applyAuth(await loginRequest(request));
  const handleRegister = async (request: RegisterRequest) => applyAuth(await registerRequest(request));

  const handleLogout = async () => {
    try {
      await logoutRequest(token);
    } finally {
      clearStoredAuth();
      setToken(null);
      setUser(null);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isAdmin: Boolean(user?.isAdmin),
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
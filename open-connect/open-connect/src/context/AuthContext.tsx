import React, { createContext, useEffect, useContext, useState } from 'react';
import { loadAuthSession, saveAuthSession, clearAuthSessionStorage } from '../services/auth-session';
import { getDeviceKey, logout, me, refresh } from '../services/auth.service';

interface UserProfile {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  showAuthModal: (message?: string) => void;
  hideAuthModal: () => void;
  user: UserProfile | null;
  setAuthSession: (session: { user: UserProfile; accessToken?: string | null; refreshToken?: string | null }) => void;
  clearAuthSession: () => void;
  logoutSession: () => Promise<void>;
  setLoading: (value: boolean) => void;
  showProfileModal: boolean;
  openProfile: () => void;
  closeProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isLoggedIn = Boolean(user);

  const showAuthModal = (_message?: string) => setShowModal(true);
  const hideAuthModal = () => setShowModal(false);
  const openProfile = () => setShowProfileModal(true);
  const closeProfile = () => setShowProfileModal(false);
  const setAuthSession = (session: { user: UserProfile; accessToken?: string | null; refreshToken?: string | null }) => {
    setUser(session.user);
    setAccessToken(session.accessToken ?? null);
    setRefreshToken(session.refreshToken ?? null);
    if (session.accessToken && session.refreshToken) {
      void saveAuthSession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      });
    }
  };
  const clearAuthSession = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    void clearAuthSessionStorage();
  };

  const readJwtExpiry = (token: string | null): number | null => {
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const payload = globalThis.atob?.(paddedBase64);

      if (!payload) {
        return null;
      }

      const parsed = JSON.parse(payload) as { exp?: number };
      return typeof parsed.exp === 'number' ? parsed.exp * 1000 : null;
    } catch {
      return null;
    }
  };

  const logoutSession = async () => {
    setLoading(true);

    try {
      if (refreshToken) {
        try {
          await logout(refreshToken);
        } catch {
          // Best effort logout: clear local session even if the server call fails.
        }
      }
    } finally {
      clearAuthSession();
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const hydrateSession = async () => {
      try {
        const stored = await loadAuthSession();

        if (!stored?.accessToken && !stored?.refreshToken) {
          return;
        }

        const accessTokenExpiry = readJwtExpiry(stored.accessToken);
        const refreshTokenExpiry = readJwtExpiry(stored.refreshToken);

        if (stored.accessToken && (!accessTokenExpiry || accessTokenExpiry > Date.now())) {
          try {
            const currentUser = await me(stored.accessToken);
            if (cancelled) return;

            const mappedUser = {
              name: currentUser.displayName || currentUser.email,
              email: currentUser.email,
              role: currentUser.role,
              status: currentUser.status,
            };

            setUser(mappedUser);
            setAccessToken(stored.accessToken);
            setRefreshToken(stored.refreshToken);
            await saveAuthSession(stored);
            return;
          } catch {
            // Fall through to refresh when access token is expired or invalid.
          }
        }

        if (stored.refreshToken && (!refreshTokenExpiry || refreshTokenExpiry > Date.now())) {
          const deviceKey = await getDeviceKey();
          const refreshed = await refresh({
            refreshToken: stored.refreshToken,
            deviceKey,
          });

          if (cancelled) return;

          const mappedUser = {
            name: refreshed.user.displayName || refreshed.user.email,
            email: refreshed.user.email,
            role: refreshed.user.role,
            status: refreshed.user.status,
          };

          setUser(mappedUser);
          setAccessToken(refreshed.tokens.accessToken);
          setRefreshToken(refreshed.tokens.refreshToken);
          await saveAuthSession({
            accessToken: refreshed.tokens.accessToken,
            refreshToken: refreshed.tokens.refreshToken,
          });
          return;
        }

        await clearAuthSessionStorage();
      } catch {
        if (!cancelled) {
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
          await clearAuthSessionStorage();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, loading, accessToken, refreshToken,
      showModal, setShowModal, showAuthModal, hideAuthModal,
      user, setAuthSession, clearAuthSession, logoutSession, setLoading,
      showProfileModal, openProfile, closeProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

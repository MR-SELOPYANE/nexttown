import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AuthService, type RegisterInput } from "../services/auth-service";
import type { SessionUser } from "../domain/types";

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<SessionUser>;
  signUp: (input: RegisterInput) => Promise<SessionUser>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: SessionUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      await AuthService.ensureDemoAccounts();
      const session = await AuthService.currentSession();
      if (active) {
        setUser(session);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const u = await AuthService.login(email, password);
    setUser(u);
    return u;
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    const u = await AuthService.register(input);
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const u = await AuthService.refreshSession();
    setUser(u);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refresh,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function useRequireUser(): SessionUser {
  const { user, loading } = useAuth();
  if (loading) throw new Error("loading");
  if (!user) throw new Error("unauthenticated");
  return user;
}

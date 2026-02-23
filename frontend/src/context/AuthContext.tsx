import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, tokenStore } from "../api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
    updateProfile?: (payload: { email?: string; password?: string; full_name?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(tokenStore.get());
  const [isLoading, setIsLoading] = useState(true);

  // Validate stored token on mount
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    api
      .getProfile()
      .then((u) => setUser(u))
      .catch(() => {
        tokenStore.clear();
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const data = await api.login(username, password);
    tokenStore.set(data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const updateProfile = useCallback(async (payload: { email?: string; password?: string; full_name?: string }) => {
    const updated = await api.updateProfile(payload);
    setUser(updated);
  }, []);

  const signup = useCallback(
    async (username: string, email: string, password: string, fullName?: string) => {
      const data = await api.signup(username, email, password, fullName);
      tokenStore.set(data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

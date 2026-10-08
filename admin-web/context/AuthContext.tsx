"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { gql } from "@/lib/graphql";

export type User = {
  id: string;
  email: string;
  name?: string | null;
  role: "ADMIN" | "STUDENT";
};

type AuthSession = {
  token: string;
  user: User;
};

type LoginResponse = {
  login: LoginSession;
};

type LoginSession = {
  accessToken: string;
  user: User;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "lms_auth";

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user { id email role }
    }
  }
`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const session = JSON.parse(saved) as AuthSession;
        if (session.token && session.user) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setToken(session.token);
          setUser(session.user);
        }
      }
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const response = await gql<LoginResponse>(
      LOGIN_MUTATION,
      { input: { email, password } },
    );
    const session = response.login;

    if (session.user.role !== "ADMIN") {
      throw new Error("Admin access only");
    }

    setToken(session.accessToken);
    setUser(session.user);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: session.accessToken, user: session.user }),
      );
    } catch {
      // Keep the in-memory session usable when browser storage is unavailable.
    }
  }, []);

  const logout = useCallback((): void => {
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event("lms:logout"));
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // State is cleared even when browser storage is unavailable.
    }
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [loading, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

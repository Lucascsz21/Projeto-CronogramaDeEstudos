import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  USERS: "studysprint:users",
  SESSION: "studysprint:session",
} as const;

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // simple btoa, not real crypto – fine for localStorage-only auth
}

const getUsers = (): StoredUser[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) ?? "[]");
  } catch {
    return [];
  }
};

const saveUsers = (users: StoredUser[]) =>
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

const getSession = (): User | null => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) ?? "null");
  } catch {
    return null;
  }
};

const saveSession = (user: User | null) =>
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => getSession());

  // Sync to localStorage whenever user changes
  useEffect(() => {
    saveSession(user);
  }, [user]);

  const register = async (name: string, email: string, password: string) => {
    const users = getUsers();

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Já existe uma conta com este e-mail.");
    }

    if (password.length < 6) {
      throw new Error("A senha deve ter pelo menos 6 caracteres.");
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: btoa(password), // obfuscation only
    };

    saveUsers([...users, newUser]);

    const sessionUser: User = { id: newUser.id, name: newUser.name, email: newUser.email };
    setUser(sessionUser);
  };

  const login = async (email: string, password: string) => {
    const users = getUsers();
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase().trim() &&
        u.passwordHash === btoa(password)
    );

    if (!found) {
      throw new Error("E-mail ou senha incorretos.");
    }

    setUser({ id: found.id, name: found.name, email: found.email });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
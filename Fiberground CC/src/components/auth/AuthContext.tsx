import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { users } from "../../lib/mock-data";

type Role = "admin" | "mitarbeiter" | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthState {
  role: Role;
  user: User | null;
  login: (email: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fiberground_session');
    return saved ? JSON.parse(saved) : null;
  });

  const role = user?.role || null;
  const isAuthenticated = !!user;

  // Auto Logout Mechanism
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (isAuthenticated) {
        timeoutId = setTimeout(() => {
          logout();
          toast.info("Automatische Abmeldung wegen Inaktivität.");
        }, INACTIVITY_TIMEOUT);
      }
    };

    // Listen to user activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [isAuthenticated]);

  const login = (email: string) => {
    // In our mock, if email is exactly 'marcel@fiberground.de' -> admin (id '1')
    // Otherwise employee (e.g. 'sarah@fiberground.de' -> id '2')
    const match = users.find(u => u.email === email);
    if (match) {
      const u = { id: match.id, name: match.name, email: match.email, role: match.role as Role };
      setUser(u);
      localStorage.setItem('fiberground_session', JSON.stringify(u));
      return true;
    }
    
    // Default Fallback Fake Login for ease of use
    if (email.includes("admin")) {
      const u = { id: "1", name: "Marcel", email, role: "admin" as Role };
      setUser(u);
      localStorage.setItem('fiberground_session', JSON.stringify(u));
      return true;
    } else {
      const u = { id: "2", name: "Sarah B.", email, role: "mitarbeiter" as Role };
      setUser(u);
      localStorage.setItem('fiberground_session', JSON.stringify(u));
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fiberground_session');
  };

  return (
    <AuthContext.Provider value={{ role, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

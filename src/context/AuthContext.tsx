import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/auth';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    pass: string,
    goalMl?: number
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const DEFAULT_USERS_KEY = 'water_cons_users_db_v1';
const ACTIVE_SESSION_KEY = 'water_cons_active_session_v1';

// Stored account record
interface StoredAccount {
  user: UserProfile;
  passHash: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const session = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        // If it was the old demo user, purge it so user starts fresh
        if (parsed.email === 'alex@watercons.io') {
          localStorage.removeItem(ACTIVE_SESSION_KEY);
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Purge any old demo user from accounts DB
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DEFAULT_USERS_KEY);
      if (stored) {
        const db: StoredAccount[] = JSON.parse(stored);
        const filtered = db.filter((acc) => acc.user.email !== 'alex@watercons.io');
        localStorage.setItem(DEFAULT_USERS_KEY, JSON.stringify(filtered));
      }
    } catch {
      // storage fallback
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const stored = localStorage.getItem(DEFAULT_USERS_KEY);
      const db: StoredAccount[] = stored ? JSON.parse(stored) : [];
      const match = db.find(
        (acc) => acc.user.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!match) {
        return { success: false, error: 'No account found with this email address.' };
      }

      if (match.passHash !== pass) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      setCurrentUser(match.user);
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(match.user));
      return { success: true };
    } catch {
      return { success: false, error: 'An unexpected error occurred during login.' };
    }
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    goalMl: number = 2500
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const stored = localStorage.getItem(DEFAULT_USERS_KEY);
      const db: StoredAccount[] = stored ? JSON.parse(stored) : [];

      const exists = db.some((acc) => acc.user.email.toLowerCase() === cleanEmail);
      if (exists) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'WC';

      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        avatarSeed: initials,
        weightKg: 68,
        activityLevel: 'moderate',
        climate: 'temperate',
        dailyGoalMl: goalMl,
        unit: 'ml',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };

      const updatedDB: StoredAccount[] = [...db, { user: newUser, passHash: pass }];
      localStorage.setItem(DEFAULT_USERS_KEY, JSON.stringify(updatedDB));

      // Automatically log in newly registered user
      setCurrentUser(newUser);
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(newUser));

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to create account. Please try again.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch {
      // storage fallback
    }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);

    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(updated));

      // Also update in accounts DB
      const stored = localStorage.getItem(DEFAULT_USERS_KEY);
      if (stored) {
        const db: StoredAccount[] = JSON.parse(stored);
        const newDb = db.map((acc) => (acc.user.id === updated.id ? { ...acc, user: updated } : acc));
        localStorage.setItem(DEFAULT_USERS_KEY, JSON.stringify(newDb));
      }
    } catch {
      // storage fallback
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

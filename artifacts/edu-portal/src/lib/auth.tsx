import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

export type UserRole = "teacher" | "student";

export interface User {
  id: string;
  fullName: string;
  phone: string;
  role: UserRole;
  passwordHash: string;
  classLevel?: number;
  subjects?: string[];
  avatarUrl?: string;
  createdAt: any;
  lastActive?: any;
  streak?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved session
    const uid = localStorage.getItem("eduportal:uid");

    if (!uid || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    // Real-time listener — keeps user logged in across sessions
    const unsubscribe = onSnapshot(
      doc(db, "users", uid),
      (docSnap) => {
        if (docSnap.exists()) {
          const userData = { id: docSnap.id, ...docSnap.data() } as User;
          setUser(userData);
          // Keep role in localStorage for quick access
          localStorage.setItem("eduportal:role", userData.role);
        } else {
          // User document deleted — clear session
          setUser(null);
          localStorage.removeItem("eduportal:uid");
          localStorage.removeItem("eduportal:role");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Auth listener error:", err);
        // On error still try to load from cache
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signOut = () => {
    localStorage.removeItem("eduportal:uid");
    localStorage.removeItem("eduportal:role");
    setUser(null);
    window.location.href = "/";
  };

  const refreshUser = async () => {
    const uid = localStorage.getItem("eduportal:uid");
    if (!uid || !isFirebaseConfigured) return;
    try {
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) {
        setUser({ id: docSnap.id, ...docSnap.data() } as User);
      }
    } catch (err) {
      console.error("Refresh user error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
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

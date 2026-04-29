import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { toast } from "sonner";

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
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestSignupOtp(phone: string) {
  if (!isFirebaseConfigured) {
    toast.success("Demo OTP: 123456 — In production, send via Twilio / Firebase Phone Auth.");
    return "123456";
  }
  const code = generateOtp();
  const otpId = `otp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  await setDoc(doc(db, "otps", otpId), {
    phone,
    code,
    purpose: "signup",
    consumed: false,
    createdAt: serverTimestamp()
  });
  toast.success(`Demo OTP: ${code} — In production, send via Twilio / Firebase Phone Auth.`);
  return code;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = localStorage.getItem("eduportal:uid");
    if (!uid || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "users", uid), (docSnap) => {
      if (docSnap.exists()) {
        setUser({ id: docSnap.id, ...docSnap.data() } as User);
      } else {
        setUser(null);
        localStorage.removeItem("eduportal:uid");
      }
      setLoading(false);
    }, (err) => {
      console.error("Auth listener error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = () => {
    localStorage.removeItem("eduportal:uid");
    setUser(null);
  };

  const refreshUser = async () => {
    const uid = localStorage.getItem("eduportal:uid");
    if (!uid || !isFirebaseConfigured) return;
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      setUser({ id: docSnap.id, ...docSnap.data() } as User);
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

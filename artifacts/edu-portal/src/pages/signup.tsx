import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2, GraduationCap, Users, Eye, EyeOff } from "lucide-react";
import { hashPassword } from "@/lib/auth";
import AnimatedBg from "@/components/animated-bg";
import Particles from "@/components/particles";
import { SUBJECTS, CLASS_LEVELS } from "@/lib/constants";
import { toast } from "sonner";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "teacher" ? "teacher" : "student";

  const [role, setRole] = useState<"student" | "teacher">(initialRole);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [classLevel, setClassLevel] = useState("6");
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const toggleSubject = (s: string) =>
    setTeacherSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFirebaseConfigured) {
      toast.error("Firebase not configured");
      return;
    }
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (role === "teacher" && teacherSubjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    setLoading(true);
    try {
      // Check if phone already exists
      const existing = await getDocs(
        query(collection(db, "users"), where("phone", "==", phone.trim()))
      );
      if (!existing.empty) {
        toast.error("An account with this phone number already exists. Please log in.");
        setLoading(false);
        return;
      }

      const hashed = await hashPassword(password);
      const newUserRef = doc(collection(db, "users"));

      await setDoc(newUserRef, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        role,
        passwordHash: hashed,
        ...(role === "student"
          ? { classLevel: parseInt(classLevel, 10) }
          : { subjects: teacherSubjects }),
        createdAt: serverTimestamp(),
        streak: 0,
        lastLoginAt: serverTimestamp(),
      });

      // Save to localStorage for persistent login
      localStorage.setItem("eduportal:uid", newUserRef.id);
      localStorage.setItem("eduportal:role", role);

      toast.success("🎉 Account created successfully! Welcome to EDU PORTAL!");

      setTimeout(() => {
        window.location.href = role === "teacher" ? "/teacher" : "/student";
      }, 500);

    } catch (err) {
      console.error(err);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-background min-h-[100dvh]">
      <AnimatedBg />
      <Particles count={24} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-md glass p-8 rounded-2xl relative z-10 my-8"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(124,58,237,0.5)]">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-center">
            Create Account
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Join EDU PORTAL today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === "student"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 text-muted-foreground"
              }`}
            >
              <GraduationCap className="w-6 h-6" />
              <span className="font-medium text-sm">Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === "teacher"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border hover:border-accent/50 text-muted-foreground"
              }`}
            >
              <Users className="w-6 h-6" />
              <span className="font-medium text-sm">Teacher</span>
            </button>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="10-digit phone number"
              maxLength={10}
            />
          </div>

          {/* Class (students only) */}
          {role === "student" && (
            <div className="space-y-1.5">
              <Label>Your Class</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
              >
                {CLASS_LEVELS.map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Subjects (teachers only) */}
          {role === "teacher" && (
            <div className="space-y-1.5">
              <Label>
                Subjects you teach{" "}
                <span className="text-muted-foreground text-xs">
                  (select all that apply)
                </span>
              </Label>
              <div className="max-h-44 overflow-y-auto p-2 rounded-md border border-input bg-background/40 grid grid-cols-2 gap-1">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSubject(s)}
                    className={`text-xs text-left px-2 py-1.5 rounded transition-colors ${
                      teacherSubjects.includes(s)
                        ? "bg-accent text-accent-foreground font-medium"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {teacherSubjects.includes(s) ? "✓ " : ""}{s}
                  </button>
                ))}
              </div>
              {teacherSubjects.length > 0 && (
                <p className="text-xs text-accent">
                  {teacherSubjects.length} subject{teacherSubjects.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min 6 characters"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
                className={`pr-10 ${
                  confirmPassword && password !== confirmPassword
                    ? "border-red-500"
                    : confirmPassword && password === confirmPassword
                    ? "border-emerald-500"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-400">Passwords do not match</p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="text-xs text-emerald-400">✓ Passwords match</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium mt-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            disabled={loading}
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
            Create Account
          </Button>

          <p className="text-center text-sm text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline underline-offset-4"
            >
              Log in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

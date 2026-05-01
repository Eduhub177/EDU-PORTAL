import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { hashPassword } from "@/lib/auth";
import { toast } from "sonner";
import { isFirebaseConfigured, db } from "@/lib/firebase";
import AnimatedBg from "@/components/animated-bg";
import Particles from "@/components/particles";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [foundUserId, setFoundUserId] = useState<string | null>(null);

  // Step 1 — verify phone exists
  const handleFindAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      toast.error("Firebase not configured");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("phone", "==", phone.trim())
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        toast.error("No account found with this phone number");
        return;
      }
      setFoundUserId(snap.docs[0].id);
      toast.success("Account found! Set your new password.");
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error("Failed to find account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundUserId) return;
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const hashed = await hashPassword(password);
      await updateDoc(doc(db, "users", foundUserId), {
        passwordHash: hashed,
      });
      toast.success("✅ Password reset successfully! Please log in.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-background min-h-[100dvh]">
      <AnimatedBg />
      <Particles count={20} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-md glass p-8 rounded-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(124,58,237,0.5)]">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-center">
            Reset Password
          </h1>
          <p className="text-muted-foreground text-sm mt-1 text-center">
            {step === 1
              ? "Enter your phone number to find your account"
              : "Set a new password for your account"}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            step >= 1 ? "bg-primary text-white" : "bg-border text-muted-foreground"
          }`}>
            {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
          </div>
          <div className={`h-0.5 w-12 transition-colors ${
            step > 1 ? "bg-primary" : "bg-border"
          }`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            step >= 2 ? "bg-primary text-white" : "bg-border text-muted-foreground"
          }`}>
            2
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* Step 1 — Find account by phone */}
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleFindAccount}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="Enter your registered phone number"
                  maxLength={10}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-purple-600"
                disabled={loading}
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                Find My Account
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline underline-offset-4"
                >
                  Log in
                </Link>
              </p>
            </motion.form>
          )}

          {/* Step 2 — Set new password */}
          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPassword}
              className="space-y-4"
            >
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400">
                ✅ Account found for {phone}. Set your new password below.
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">New Password</Label>
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
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter new password"
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

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-purple-600"
                disabled={loading}
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                Reset Password
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ← Back
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2 } from "lucide-react";
import { requestSignupOtp } from "@/lib/auth"; // Reuse the same OTP func for demo
import { toast } from "sonner";
import { isFirebaseConfigured } from "@/lib/firebase";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      toast.error("Firebase not configured");
      return;
    }
    setLoading(true);
    try {
      await requestSignupOtp(phone);
      setStep(2);
    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    // Simulating OTP verification delay
    setTimeout(() => {
      setStep(3);
      setLoading(false);
    }, 1000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulating password reset
    setTimeout(() => {
      toast.success("Password reset successfully");
      navigate("/login");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-background to-background"></div>
      
      <div className="w-full max-w-md glass p-8 rounded-2xl relative z-10 overflow-hidden">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-center">Reset Password</h1>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="9876543210" />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-medium mt-4" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Send Reset Code
              </Button>
              <p className="text-center mt-4 text-sm">
                <Link to="/login" className="text-primary hover:underline">Back to Login</Link>
              </p>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerifyOtp} className="space-y-6 flex flex-col items-center">
              <div className="text-center mb-4">
                <h2 className="text-xl font-medium">Verify your phone</h2>
                <p className="text-muted-foreground text-sm mt-1">We sent a 6-digit code to {phone}</p>
              </div>
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={loading || otp.length !== 6}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Verify Code
              </Button>
              <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={loading}>Back</Button>
            </motion.form>
          )}

          {step === 3 && (
             <motion.form key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleResetPassword} className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="password">New Password</Label>
               <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
             </div>
             <Button type="submit" className="w-full h-12 text-lg font-medium mt-4" disabled={loading}>
               {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
               Reset Password
             </Button>
           </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

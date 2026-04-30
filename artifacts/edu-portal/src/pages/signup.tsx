import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BookOpen, Loader2, GraduationCap, Users } from "lucide-react";
import { requestSignupOtp, hashPassword } from "@/lib/auth";
import AnimatedBg from "@/components/animated-bg";
import Particles from "@/components/particles";
import { SUBJECTS, CLASS_LEVELS } from "@/lib/constants";
import { toast } from "sonner";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function Signup() {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "teacher" ? "teacher" : "student";
  const [role, setRole] = useState<"student" | "teacher">(initialRole);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [classLevel, setClassLevel] = useState("9");
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);

  const toggleSubject = (s: string) =>
    setTeacherSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  
  // OTP State
  const [otp, setOtp] = useState("");

  const handleStep1Submit = async (e: React.FormEvent) => {
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
      console.error(err);
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setLoading(true);
    try {
      const hashed = await hashPassword(password);
      
      const newUserRef = doc(collection(db, "users"));
      await setDoc(newUserRef, {
        fullName,
        phone,
        role,
        passwordHash: hashed,
        ...(role === "student"
          ? { classLevel: parseInt(classLevel, 10) }
          : { subjects: teacherSubjects.length ? teacherSubjects : [...SUBJECTS] }),
        createdAt: serverTimestamp(),
        streak: 0
      });

      localStorage.setItem("eduportal:uid", newUserRef.id);
      toast.success("Account created successfully!");
      window.location.href = role === "teacher" ? "/teacher" : "/student";
    } catch (err) {
      console.error(err);
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <AnimatedBg />
      <Particles count={24} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-md glass p-8 rounded-2xl relative z-10 overflow-hidden animate-glow-pulse"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-center">Create Account</h1>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleStep1Submit} 
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4 mb-6">
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
                  <span className="font-medium">Student</span>
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
                  <span className="font-medium">Teacher</span>
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="John Doe" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="9876543210" />
              </div>

              {role === "student" && (
                <div className="space-y-2">
                  <Label>Class</Label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                  >
                    {CLASS_LEVELS.map((c) => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>
              )}

              {role === "teacher" && (
                <div className="space-y-2">
                  <Label>Subjects you teach <span className="text-muted-foreground text-xs">(pick one or more)</span></Label>
                  <div className="max-h-40 overflow-y-auto p-2 rounded-md border border-input bg-background/40 grid grid-cols-2 gap-1">
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
                        data-testid={`button-subject-${s.replace(/\s/g, "-")}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {teacherSubjects.length === 0 && (
                    <p className="text-xs text-muted-foreground">Leave empty to enable all subjects.</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
              </div>

              <Button type="submit" className="w-full h-12 text-lg font-medium mt-4" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Continue
              </Button>
              
              <p className="text-center mt-6 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Log in
                </Link>
              </p>
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleStep2Submit} 
              className="space-y-6 flex flex-col items-center"
            >
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
                Verify & Create Account
              </Button>
              
              <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={loading}>
                Back
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

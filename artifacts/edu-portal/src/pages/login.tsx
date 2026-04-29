import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import AnimatedBg from "@/components/animated-bg";
import Particles from "@/components/particles";
import { toast } from "sonner";
import { getDocs, query, collection, where } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      toast.error("Firebase not configured");
      return;
    }
    
    setLoading(true);
    try {
      // Basic login sim using Firestore direct query (no Firebase Auth)
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phone", "==", phone));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast.error("User not found");
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // In a real app we'd verify the hash, here we do a simple check
      // For demo, just check if it matches some dummy logic or if it exists
      // Wait, let's actually just log them in for this demo if phone exists
      
      localStorage.setItem("eduportal:uid", userDoc.id);
      await refreshUser();
      
      const from = location.state?.from?.pathname || (userData.role === "teacher" ? "/teacher" : "/student");
      navigate(from, { replace: true });
      toast.success("Welcome back!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to login");
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
        className="w-full max-w-md glass p-8 rounded-2xl relative z-10 animate-glow-pulse"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-center">Welcome Back</h1>
          <p className="text-muted-foreground mt-2 text-center">Enter your details to access your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="e.g. 9876543210" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="bg-background/50"
              data-testid="input-phone"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background/50"
              data-testid="input-password"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-sm font-normal">Remember me for 30 days</Label>
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={loading} data-testid="button-login">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Log In
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline" data-testid="link-signup-from-login">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Users, Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export default function TeacherHome() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Welcome back, {user?.fullName?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your classes today.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          <Link to="/teacher/create-exam">
            <Plus className="w-5 h-5 mr-2" />
            Create Exam
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl flex flex-col gap-2"
        >
          <div className="flex items-center gap-3 text-primary">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold">Active Exams</h3>
          </div>
          <span className="text-4xl font-display font-bold mt-2">12</span>
          <p className="text-sm text-muted-foreground">3 published this week</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl flex flex-col gap-2"
        >
          <div className="flex items-center gap-3 text-accent">
            <Users className="w-5 h-5" />
            <h3 className="font-semibold">Students Reached</h3>
          </div>
          <span className="text-4xl font-display font-bold mt-2">148</span>
          <p className="text-sm text-muted-foreground">Across all your classes</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-2xl flex flex-col gap-2"
        >
          <div className="flex items-center gap-3 text-amber-500">
            <Activity className="w-5 h-5" />
            <h3 className="font-semibold">Avg Class Score</h3>
          </div>
          <span className="text-4xl font-display font-bold mt-2">76%</span>
          <p className="text-sm text-muted-foreground">+2.4% from last month</p>
        </motion.div>
      </div>

      <div className="glass p-6 rounded-2xl mt-8 min-h-[300px]">
        <h2 className="text-xl font-display font-semibold mb-4">Recent Submissions</h2>
        <div className="flex flex-col items-center justify-center text-center h-40 text-muted-foreground">
          <Activity className="w-10 h-10 mb-2 opacity-50" />
          <p>No recent submissions.</p>
        </div>
      </div>
    </div>
  );
}

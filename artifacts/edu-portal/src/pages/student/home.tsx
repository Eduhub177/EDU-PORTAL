import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Trophy, Activity, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { subjectColor } from "@/lib/utils";

export default function StudentHome() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Hello, {user?.fullName?.split(" ")[0]}!</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-amber-500 font-medium text-sm">
              <Activity className="w-4 h-4" /> 3 Day Streak
            </span>
            <span className="text-muted-foreground text-sm">• Class {user?.classLevel}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-6 rounded-2xl flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-display font-bold text-accent">#4</span>
              <span className="text-sm text-muted-foreground mb-1">/ 42</span>
            </div>
          </div>
          <Trophy className="w-12 h-12 text-accent/20" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-6 rounded-2xl flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-muted-foreground mb-1">Average Score</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-display font-bold text-primary">84%</span>
            </div>
          </div>
          <FileText className="w-12 h-12 text-primary/20" />
        </motion.div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold">Available Exams</h2>
          <Button variant="link" asChild className="text-accent">
            <Link to="/student/exams">View All</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Dummy Exam Card */}
          <div className="glass p-5 rounded-2xl flex flex-col hover:border-accent/40 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-400">Physics</span>
              <span className="text-xs text-muted-foreground">30 mins</span>
            </div>
            <h3 className="font-semibold text-lg mb-1">Kinematics Final</h3>
            <p className="text-sm text-muted-foreground mb-4">By Mr. Smith • 20 Questions</p>
            <Button className="mt-auto w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Play className="w-4 h-4 mr-2" /> Start Exam
            </Button>
          </div>

          <div className="glass p-5 rounded-2xl flex flex-col hover:border-accent/40 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400">Biology</span>
              <span className="text-xs text-muted-foreground">45 mins</span>
            </div>
            <h3 className="font-semibold text-lg mb-1">Cell Structure</h3>
            <p className="text-sm text-muted-foreground mb-4">By Ms. Davis • 30 Questions</p>
            <Button className="mt-auto w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Play className="w-4 h-4 mr-2" /> Start Exam
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

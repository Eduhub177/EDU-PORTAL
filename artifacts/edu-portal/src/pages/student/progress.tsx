import { Link } from "react-router-dom";
import { Activity, TrendingUp, Target, Award } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function StudentProgress() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold">My Progress</h1>
        <p className="text-muted-foreground mt-1">Track your learning journey over time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Average Score</span>
          </div>
          <p className="text-3xl font-display font-bold">84%</p>
        </div>
        <div className="glass p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Award className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Highest Score</span>
          </div>
          <p className="text-3xl font-display font-bold text-accent">96%</p>
        </div>
        <div className="glass p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">Exams Passed</span>
          </div>
          <p className="text-3xl font-display font-bold text-green-400">5 <span className="text-sm text-muted-foreground font-normal">/ 5</span></p>
        </div>
        <div className="glass p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">Current Streak</span>
          </div>
          <p className="text-3xl font-display font-bold text-amber-500">{user?.streak || 0} Days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-xl font-display font-semibold mb-4">Performance Over Time</h2>
          <div className="h-64 flex items-center justify-center text-muted-foreground bg-background/30 rounded-xl border border-border/50 border-dashed">
            Chart placeholder (Recharts)
          </div>
        </div>
        
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-xl font-display font-semibold mb-4">Subject Averages</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-blue-400">Physics</span>
                <span>88%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-green-400">Biology</span>
                <span>92%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-orange-400">Mathematics</span>
                <span>75%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

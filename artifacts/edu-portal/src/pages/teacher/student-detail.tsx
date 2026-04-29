import { Link, useParams } from "react-router-dom";
import { ArrowLeft, TrendingUp, Activity, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentDetail() {
  const { id } = useParams();
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/teacher/students"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">Alex Johnson</h1>
          <p className="text-muted-foreground mt-1">Class 10 • Student Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Average Score</span>
          </div>
          <p className="text-3xl font-display font-bold">88%</p>
        </div>
        <div className="glass p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <FileText className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Exams Taken</span>
          </div>
          <p className="text-3xl font-display font-bold">5</p>
        </div>
        <div className="glass p-5 rounded-2xl md:col-span-2 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Best Subject</p>
            <p className="text-xl font-display font-bold text-green-400">Physics</p>
          </div>
          <div className="h-10 w-[1px] bg-border/50"></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Weak Area</p>
            <p className="text-xl font-display font-bold text-amber-500">Biology</p>
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl">
        <h2 className="text-xl font-display font-semibold mb-4">Score Trend</h2>
        <div className="h-64 flex items-center justify-center text-muted-foreground bg-background/30 rounded-xl border border-border/50 border-dashed">
          Chart placeholder (Recharts)
        </div>
      </div>
      
      <div className="glass p-6 rounded-2xl">
        <h2 className="text-xl font-display font-semibold mb-4">Exam History</h2>
        <div className="text-center py-8 text-muted-foreground">
          No history available for this student yet.
        </div>
      </div>
    </div>
  );
}

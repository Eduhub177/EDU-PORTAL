import { Link } from "react-router-dom";
import { Play, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";

export default function StudentExams() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold">Available Exams</h1>
        <p className="text-muted-foreground mt-1">Exams published for Class {user?.classLevel}.</p>
      </div>

      <div className="glass p-4 rounded-2xl flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search exams by title or subject..." 
            className="pl-9 bg-background/50 border-border"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
            <option value="All">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl flex flex-col hover:border-accent/40 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-400">Physics</span>
            <span className="text-xs text-muted-foreground">30 mins</span>
          </div>
          <h3 className="font-semibold text-lg mb-1">Kinematics Final</h3>
          <p className="text-sm text-muted-foreground mb-4">By Mr. Smith • 20 Questions</p>
          <Button asChild className="mt-auto w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to="/exam/1">
              <Play className="w-4 h-4 mr-2" /> Start Exam
            </Link>
          </Button>
        </div>
        
        <div className="glass p-5 rounded-2xl flex flex-col hover:border-accent/40 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400">Biology</span>
            <span className="text-xs text-muted-foreground">45 mins</span>
          </div>
          <h3 className="font-semibold text-lg mb-1">Cell Structure</h3>
          <p className="text-sm text-muted-foreground mb-4">By Ms. Davis • 30 Questions</p>
          <Button asChild className="mt-auto w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to="/exam/2">
              <Play className="w-4 h-4 mr-2" /> Start Exam
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

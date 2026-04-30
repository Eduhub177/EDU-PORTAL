import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Users, Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useCollection } from "@/hooks/use-firestore";
import { where } from "firebase/firestore";

interface ExamDoc { id: string; status: string; teacherId: string; classLevel: number; }
interface ResultDoc { id: string; examId: string; studentId: string; score: number; teacherId?: string; }

export default function TeacherHome() {
  const { user } = useAuth();

  const { data: exams, loading: examsLoading } = useCollection<ExamDoc>(
    "exams",
    where("teacherId", "==", user?.id || "_none_"),
  );
  const { data: results, loading: resultsLoading } = useCollection<ResultDoc>(
    "results",
    where("teacherId", "==", user?.id || "_none_"),
  );

  const publishedCount = exams.filter((e) => e.status === "published").length;
  const draftCount = exams.filter((e) => e.status === "draft").length;
  const studentsReached = new Set(results.map((r) => r.studentId)).size;
  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + (r.score || 0), 0) / results.length)
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Welcome back, {user?.fullName?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your classes today.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          <Link to="/teacher/create-exam" data-testid="button-create-exam">
            <Plus className="w-5 h-5 mr-2" />
            Create Exam
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          color="text-primary"
          label="Published Exams"
          value={examsLoading ? "—" : String(publishedCount)}
          sub={examsLoading ? "Loading…" : `${draftCount} draft${draftCount === 1 ? "" : "s"}`}
          delay={0}
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          color="text-accent"
          label="Students Reached"
          value={resultsLoading ? "—" : String(studentsReached)}
          sub={resultsLoading ? "Loading…" : "Unique attempts"}
          delay={0.1}
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          color="text-amber-500"
          label="Avg Class Score"
          value={resultsLoading ? "—" : results.length > 0 ? `${avgScore}%` : "—"}
          sub={resultsLoading ? "Loading…" : results.length > 0 ? `${results.length} total result${results.length === 1 ? "" : "s"}` : "No results yet"}
          delay={0.2}
        />
      </div>

      <div className="glass p-6 rounded-2xl mt-8 min-h-[300px]">
        <h2 className="text-xl font-display font-semibold mb-4">Recent Submissions</h2>
        {resultsLoading ? (
          <div className="flex flex-col items-center justify-center text-center h-40 text-muted-foreground">
            <Activity className="w-10 h-10 mb-2 opacity-50 animate-pulse" />
            <p>Loading…</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-40 text-muted-foreground">
            <Activity className="w-10 h-10 mb-2 opacity-50" />
            <p>No results yet</p>
            <p className="text-xs mt-1">Submissions will appear here once students take your exams.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {results.slice(-10).reverse().map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm py-2 border-b border-border/30 last:border-0">
                <span className="font-medium">Exam #{r.examId.slice(0, 6)}</span>
                <span className="font-bold text-primary">{r.score}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon, color, label, value, sub, delay,
}: { icon: React.ReactNode; color: string; label: string; value: string; sub: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass p-6 rounded-2xl flex flex-col gap-2"
    >
      <div className={`flex items-center gap-3 ${color}`}>
        {icon}
        <h3 className="font-semibold">{label}</h3>
      </div>
      <span className="text-4xl font-display font-bold mt-2">{value}</span>
      <p className="text-sm text-muted-foreground">{sub}</p>
    </motion.div>
  );
}

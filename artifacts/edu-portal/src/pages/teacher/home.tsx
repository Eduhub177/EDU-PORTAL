import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Users, Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useCollection } from "@/hooks/use-firestore";
import { where } from "firebase/firestore";

interface ExamDoc {
  id: string;
  title: string;
  status: string;
  teacherId: string;
  classLevel: number;
  subject: string;
}

interface ResultDoc {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentClass: number;
  score: number;
  total: number;
  percentage: number;
  teacherId?: string;
  submittedAt?: any;
}

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

  // Use percentage not raw score
  const avgScore =
    results.length > 0
      ? Math.round(
          results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length
        )
      : null;

  // Sort by newest first
  const recentResults = [...results]
    .sort((a, b) => {
      const aTime = a.submittedAt?.toMillis?.() || 0;
      const bTime = b.submittedAt?.toMillis?.() || 0;
      return bTime - aTime;
    })
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Welcome back, {user?.fullName?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening in your classes today.
          </p>
        </div>
        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]"
        >
          <Link to="/teacher/create-exam">
            <Plus className="w-5 h-5 mr-2" />
            Create Exam
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          color="text-primary"
          label="Published Exams"
          value={examsLoading ? "—" : String(publishedCount)}
          sub={
            examsLoading
              ? "Loading…"
              : `${draftCount} draft${draftCount === 1 ? "" : "s"}`
          }
          delay={0}
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          color="text-accent"
          label="Students Reached"
          value={resultsLoading ? "—" : String(studentsReached)}
          sub={resultsLoading ? "Loading…" : "Unique students"}
          delay={0.1}
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          color="text-amber-500"
          label="Avg Class Score"
          value={
            resultsLoading
              ? "—"
              : avgScore !== null
              ? `${avgScore}%`
              : "—"
          }
          sub={
            resultsLoading
              ? "Loading…"
              : results.length > 0
              ? `${results.length} total submission${results.length === 1 ? "" : "s"}`
              : "No results yet"
          }
          delay={0.2}
        />
      </div>

      {/* Recent Submissions */}
      <div className="glass p-6 rounded-2xl min-h-[300px]">
        <h2 className="text-xl font-display font-semibold mb-4">
          Recent Submissions
        </h2>
        {resultsLoading ? (
          <div className="flex flex-col items-center justify-center text-center h-40 text-muted-foreground">
            <Activity className="w-10 h-10 mb-2 opacity-50 animate-pulse" />
            <p>Loading…</p>
          </div>
        ) : recentResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-40 text-muted-foreground">
            <Activity className="w-10 h-10 mb-2 opacity-50" />
            <p className="font-medium">No submissions yet</p>
            <p className="text-xs mt-1">
              Results will appear here once students take your exams.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentResults.map((r) => {
              const pct = r.percentage || 0;
              const passed = pct >= 50;
              // Get exam title from examTitle field or find from exams list
              const examTitle =
                r.examTitle ||
                exams.find((e) => e.id === r.examId)?.title ||
                "Unknown Exam";
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between text-sm py-3 px-3 rounded-lg border border-border/30 bg-background/20 hover:bg-background/40 transition-colors"
                >
                  <div>
                    <p className="font-medium">{examTitle}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.studentName || "Student"} · Class {r.studentClass || "—"}
                      {" · "}
                      {r.score}/{r.total} correct
                    </p>
                  </div>
                  <span
                    className={`font-bold text-sm px-3 py-1 rounded-full ${
                      passed
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  color,
  label,
  value,
  sub,
  delay,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  value: string;
  sub: string;
  delay: number;
}) {
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

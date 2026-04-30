import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Flame, ChartLine, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCollection } from "@/hooks/use-firestore";
import { where } from "firebase/firestore";

interface ResultDoc { id: string; studentId: string; examId: string; score: number; createdAt?: any; }
interface ExamDoc { id: string; title: string; subject: string; status: string; classLevel: number; }

export default function StudentHome() {
  const { user } = useAuth();

  const { data: results, loading: resultsLoading } = useCollection<ResultDoc>(
    "results",
    where("studentId", "==", user?.id || "_none_"),
  );
  const { data: exams, loading: examsLoading } = useCollection<ExamDoc>(
    "exams",
    where("status", "==", "published"),
    where("classLevel", "==", user?.classLevel || -1),
  );

  const examsTaken = results.length;
  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + (r.score || 0), 0) / results.length)
      : 0;
  const streak = user?.streak || 0;

  const upcoming = exams
    .filter((e) => !results.some((r) => r.examId === e.id))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Hi, {user?.fullName?.split(" ")[0]}!</h1>
        <p className="text-muted-foreground mt-1">Ready to learn something new today?</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={<BookOpen className="w-5 h-5" />} color="text-primary" label="Exams Taken" value={resultsLoading ? "—" : String(examsTaken)} />
        <Stat icon={<Trophy className="w-5 h-5" />} color="text-amber-500" label="Avg Score" value={resultsLoading ? "—" : examsTaken > 0 ? `${avgScore}%` : "—"} />
        <Stat icon={<Flame className="w-5 h-5" />} color="text-orange-500" label="Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
        <Stat icon={<ChartLine className="w-5 h-5" />} color="text-accent" label="Class Level" value={user?.classLevel ? `Class ${user.classLevel}` : "—"} />
      </div>

      <div className="glass p-6 rounded-2xl min-h-[280px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold">Available Exams</h2>
          <Link to="/student/exams" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {examsLoading ? (
          <div className="flex flex-col items-center justify-center text-center h-40 text-muted-foreground">
            <BookOpen className="w-10 h-10 mb-2 opacity-50 animate-pulse" />
            <p>Loading exams…</p>
          </div>
        ) : upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-40 text-muted-foreground">
            <BookOpen className="w-10 h-10 mb-2 opacity-50" />
            <p>No exams available right now</p>
            <p className="text-xs mt-1">Check back soon — your teachers will publish exams here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((exam, i) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/student/exam/${exam.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div>
                    <p className="font-medium">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">{exam.subject}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, color, label, value }: { icon: React.ReactNode; color: string; label: string; value: string }) {
  return (
    <div className="glass p-4 rounded-xl flex flex-col gap-1">
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-2xl font-display font-bold">{value}</span>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, ArrowRight, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useCollection } from "@/hooks/use-firestore";
import { where } from "firebase/firestore";
import { subjectColor } from "@/lib/utils";

interface ExamDoc {
  id: string; title: string; subject: string; classLevel: number;
  status: string; duration?: number; questions?: any[]; teacherName?: string;
}
interface ResultDoc { id: string; examId: string; studentId: string; }

export default function StudentExams() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  const { data: exams, loading } = useCollection<ExamDoc>(
    "exams",
    where("status", "==", "published"),
    where("classLevel", "==", user?.classLevel || -1),
  );
  const { data: results } = useCollection<ResultDoc>(
    "results",
    where("studentId", "==", user?.id || "_none_"),
  );

  const takenIds = new Set(results.map((r) => r.examId));

  const visible = exams.filter(
    (e) =>
      e.title?.toLowerCase().includes(query.toLowerCase()) ||
      e.subject?.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Available Exams</h1>
        <p className="text-muted-foreground mt-1">Pick an exam and challenge yourself.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or subject…"
          className="pl-10"
          data-testid="input-search-exams"
        />
      </div>

      {loading ? (
        <div className="glass p-12 rounded-2xl text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50 animate-pulse" />
          <p>Loading exams…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No exams available</p>
          <p className="text-xs mt-1">
            {query ? "Try a different search." : "Your teachers haven't published exams for your class yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((exam, i) => {
            const sc = subjectColor(exam.subject);
            const taken = takenIds.has(exam.id);
            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass p-5 rounded-2xl flex flex-col justify-between min-h-[180px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge style={{ backgroundColor: sc.bg, color: sc.text }} className="border-0">
                      {exam.subject}
                    </Badge>
                    {taken && <Badge variant="outline" className="text-xs">Completed</Badge>}
                  </div>
                  <h3 className="font-display font-semibold text-lg leading-tight">{exam.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span>{exam.questions?.length || 0} questions</span>
                    {exam.duration ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {exam.duration} min
                      </span>
                    ) : null}
                  </div>
                </div>
                <Link
                  to={`/student/exam/${exam.id}`}
                  className="mt-4 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium"
                  data-testid={`button-take-${exam.id}`}
                >
                  {taken ? "Retake" : "Take Exam"} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

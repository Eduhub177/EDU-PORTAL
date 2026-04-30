import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Users, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useCollection } from "@/hooks/use-firestore";
import { where } from "firebase/firestore";

interface UserDoc { id: string; fullName: string; classLevel: number; phone?: string; role: string; }
interface ResultDoc { id: string; studentId: string; teacherId?: string; score: number; }

export default function TeacherStudents() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");

  const { data: students, loading: sLoading } = useCollection<UserDoc>(
    "users",
    where("role", "==", "student"),
  );
  const { data: results } = useCollection<ResultDoc>(
    "results",
    where("teacherId", "==", user?.id || "_none_"),
  );

  // Limit to students who've taken at least one of *my* exams (no fake list).
  const myStudentIds = new Set(results.map((r) => r.studentId));
  const filtered = students.filter((s) => {
    if (!myStudentIds.has(s.id)) return false;
    if (classFilter !== "all" && String(s.classLevel) !== classFilter) return false;
    if (query && !s.fullName.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">My Students</h1>
        <p className="text-muted-foreground mt-1">Students who have taken your exams.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="pl-10"
            data-testid="input-search-students"
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        >
          <option value="all">All classes</option>
          {[6, 7, 8, 9, 10, 11, 12].map((c) => (
            <option key={c} value={c}>Class {c}</option>
          ))}
        </select>
      </div>

      {sLoading ? (
        <div className="glass p-12 rounded-2xl text-center text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50 animate-pulse" />
          <p>Loading…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No students yet</p>
          <p className="text-xs mt-1">Once students take your exams, they'll appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, i) => {
            const myResults = results.filter((r) => r.studentId === s.id);
            const avg = myResults.length > 0 ? Math.round(myResults.reduce((sum, r) => sum + r.score, 0) / myResults.length) : 0;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass p-5 rounded-2xl flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    {s.fullName?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{s.fullName}</p>
                    <p className="text-xs text-muted-foreground">Class {s.classLevel}</p>
                  </div>
                  <Badge variant="outline">{avg}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{myResults.length} exam{myResults.length === 1 ? "" : "s"} taken</p>
                <Link
                  to={`/teacher/students/${s.id}`}
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1 self-start"
                >
                  View details <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

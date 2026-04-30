import { useState } from "react";
import { motion } from "framer-motion";
import { Library, Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useCollection } from "@/hooks/use-firestore";
import { where } from "firebase/firestore";
import { SUBJECTS } from "@/lib/constants";
import { subjectColor } from "@/lib/utils";

interface QuestionDoc {
  id: string;
  text: string;
  subject: string;
  classLevel?: number;
  teacherId: string;
}

export default function TeacherInventory() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const { data: questions, loading } = useCollection<QuestionDoc>(
    "questionBank",
    where("teacherId", "==", user?.id || "_none_"),
  );

  const visible = questions.filter((q) => {
    if (subjectFilter !== "all" && q.subject !== subjectFilter) return false;
    if (query && !q.text?.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Library className="w-8 h-8 text-accent" />
          Question Bank
        </h1>
        <p className="text-muted-foreground mt-1">All questions you've authored, ready to reuse.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions…"
            className="pl-10"
            data-testid="input-search-bank"
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          data-testid="select-subject-filter"
        >
          <option value="all">All subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="glass p-12 rounded-2xl text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50 animate-pulse" />
          <p>Loading…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No questions in your bank yet</p>
          <p className="text-xs mt-1">Questions you save while creating exams will live here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((q, i) => {
            const sc = subjectColor(q.subject);
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass p-4 rounded-xl flex items-start gap-3"
              >
                <Badge style={{ backgroundColor: sc.bg, color: sc.text }} className="border-0 shrink-0">
                  {q.subject}
                </Badge>
                <p className="text-sm flex-1">{q.text}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

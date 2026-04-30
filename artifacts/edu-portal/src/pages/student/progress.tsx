import { motion } from "framer-motion";
import { TrendingUp, Award, BookOpen, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAuth } from "@/lib/auth";
import { useCollection } from "@/hooks/use-firestore";
import { where } from "firebase/firestore";

interface ResultDoc { id: string; studentId: string; examId: string; score: number; createdAt?: any; subject?: string; }

export default function StudentProgress() {
  const { user } = useAuth();
  const { data: results, loading } = useCollection<ResultDoc>(
    "results",
    where("studentId", "==", user?.id || "_none_"),
  );

  const sorted = [...results].sort((a, b) => {
    const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return ta - tb;
  });

  const chartData = sorted.map((r, i) => ({
    name: `#${i + 1}`,
    score: r.score,
  }));

  const examsTaken = results.length;
  const avg = examsTaken > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / examsTaken) : 0;
  const best = examsTaken > 0 ? Math.max(...results.map((r) => r.score)) : 0;
  const passed = results.filter((r) => r.score >= 50).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-accent" />
          My Progress
        </h1>
        <p className="text-muted-foreground mt-1">Track your performance over time.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={<BookOpen className="w-5 h-5" />} color="text-primary" label="Total Exams" value={loading ? "—" : String(examsTaken)} />
        <Stat icon={<Target className="w-5 h-5" />} color="text-accent" label="Avg Score" value={loading ? "—" : examsTaken ? `${avg}%` : "—"} />
        <Stat icon={<Award className="w-5 h-5" />} color="text-amber-500" label="Best Score" value={loading ? "—" : examsTaken ? `${best}%` : "—"} />
        <Stat icon={<TrendingUp className="w-5 h-5" />} color="text-emerald-500" label="Passed" value={loading ? "—" : `${passed}/${examsTaken}`} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 rounded-2xl min-h-[360px]"
      >
        <h2 className="text-xl font-display font-semibold mb-4">Score History</h2>
        {loading ? (
          <div className="flex flex-col items-center justify-center text-center h-60 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mb-3 opacity-50 animate-pulse" />
            <p>Loading…</p>
          </div>
        ) : examsTaken === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-60 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mb-3 opacity-50" />
            <p className="font-medium">No data yet</p>
            <p className="text-xs mt-1">Take your first exam to start tracking your progress.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                }}
              />
              <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>
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

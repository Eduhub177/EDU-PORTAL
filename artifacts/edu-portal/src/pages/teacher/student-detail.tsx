import { Link, useParams } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, FileText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useCollection } from "@/hooks/use-firestore";
import { where } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ResultDoc {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  studentId: string;
  studentName: string;
  studentClass: number;
  teacherId: string;
  score: number;
  total: number;
  percentage: number;
  submittedAt?: any;
}

interface UserDoc {
  id: string;
  fullName: string;
  classLevel: number;
  role: string;
}

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Fetch this student's results for THIS teacher's exams
  const { data: results, loading: resultsLoading } = useCollection<ResultDoc>(
    "results",
    where("studentId", "==", id || "_none_"),
    where("teacherId", "==", user?.id || "_none_"),
  );

  // Fetch student info
  const { data: users } = useCollection<UserDoc>(
    "users",
    where("__name__", "==", id || "_none_"),
  );

  const student = users[0] || null;

  // Sort results by date
  const sortedResults = [...results].sort((a, b) => {
    const aTime = a.submittedAt?.toMillis?.() || 0;
    const bTime = b.submittedAt?.toMillis?.() || 0;
    return aTime - bTime;
  });

  // Calculate stats
  const examsTaken = results.length;
  const avgScore =
    results.length > 0
      ? Math.round(
          results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length
        )
      : null;

  // Subject performance — which subject has best/worst avg score
  const subjectMap: Record<string, { total: number; count: number }> = {};
  results.forEach((r) => {
    const sub = r.subject || "Unknown";
    if (!subjectMap[sub]) subjectMap[sub] = { total: 0, count: 0 };
    subjectMap[sub].total += r.percentage || 0;
    subjectMap[sub].count += 1;
  });

  const subjectAvgs = Object.entries(subjectMap).map(([subject, data]) => ({
    subject,
    avg: Math.round(data.total / data.count),
    count: data.count,
  }));

  const bestSubject = subjectAvgs.length > 0
    ? subjectAvgs.reduce((a, b) => (a.avg > b.avg ? a : b))
    : null;

  const weakSubject = subjectAvgs.length > 0
    ? subjectAvgs.reduce((a, b) => (a.avg < b.avg ? a : b))
    : null;

  // Chart data
  const chartData = sortedResults.map((r, i) => ({
    name: `Exam ${i + 1}`,
    score: r.percentage,
    examTitle: r.examTitle || `Exam ${i + 1}`,
  }));

  // Trend — improving or declining?
  const isImproving =
    sortedResults.length >= 2
      ? sortedResults[sortedResults.length - 1].percentage >
        sortedResults[0].percentage
      : null;

  if (resultsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-2">
          <Activity className="w-8 h-8 animate-pulse text-primary mx-auto" />
          <p className="text-muted-foreground">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/teacher/students">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">
            {student?.fullName || "Student"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Class {student?.classLevel || "—"} · Student Profile
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Average Score</span>
          </div>
          <p className="text-3xl font-display font-bold">
            {avgScore !== null ? `${avgScore}%` : "—"}
          </p>
          {isImproving !== null && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${
              isImproving ? "text-emerald-400" : "text-red-400"
            }`}>
              {isImproving
                ? <><TrendingUp className="w-3 h-3" /> Improving</>
                : <><TrendingDown className="w-3 h-3" /> Declining</>
              }
            </p>
          )}
        </div>

        <div className="glass p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <FileText className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Exams Taken</span>
          </div>
          <p className="text-3xl font-display font-bold">{examsTaken}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {examsTaken === 0 ? "No exams yet" : `${examsTaken} submission${examsTaken === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="glass p-5 rounded-2xl md:col-span-2 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">
              Best Subject
            </p>
            {bestSubject ? (
              <>
                <p className="text-xl font-display font-bold text-emerald-400">
                  {bestSubject.subject}
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg: {bestSubject.avg}% · {bestSubject.count} exam{bestSubject.count === 1 ? "" : "s"}
                </p>
              </>
            ) : (
              <p className="text-xl font-display font-bold text-muted-foreground">—</p>
            )}
          </div>
          <div className="h-12 w-[1px] bg-border/50" />
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">
              Weak Subject
            </p>
            {weakSubject && weakSubject.subject !== bestSubject?.subject ? (
              <>
                <p className="text-xl font-display font-bold text-amber-500">
                  {weakSubject.subject}
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg: {weakSubject.avg}% · {weakSubject.count} exam{weakSubject.count === 1 ? "" : "s"}
                </p>
              </>
            ) : (
              <p className="text-xl font-display font-bold text-muted-foreground">
                {examsTaken === 0 ? "—" : "All same"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subject breakdown */}
      {subjectAvgs.length > 0 && (
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-xl font-display font-semibold mb-4">
            Subject Performance
          </h2>
          <div className="space-y-3">
            {subjectAvgs
              .sort((a, b) => b.avg - a.avg)
              .map((s) => (
                <div key={s.subject} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s.subject}</span>
                    <span className={`font-bold ${
                      s.avg >= 70
                        ? "text-emerald-400"
                        : s.avg >= 50
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}>
                      {s.avg}%
                    </span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        s.avg >= 70
                          ? "bg-emerald-500"
                          : s.avg >= 50
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${s.avg}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {s.count} exam{s.count === 1 ? "" : "s"} taken
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Score trend chart */}
      <div className="glass p-6 rounded-2xl">
        <h2 className="text-xl font-display font-semibold mb-4">Score Trend</h2>
        {chartData.length < 2 ? (
          <div className="h-48 flex flex-col items-center justify-center text-muted-foreground text-center border border-dashed border-border rounded-xl">
            <BookOpen className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">
              {chartData.length === 0
                ? "No exams taken yet"
                : "Need at least 2 exams to show trend"}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#888" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "#888" }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => [`${value}%`, "Score"]}
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload?.examTitle || label
                }
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#7c3aed"
                strokeWidth={2.5}
                dot={{ fill: "#7c3aed", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Exam history */}
      <div className="glass p-6 rounded-2xl">
        <h2 className="text-xl font-display font-semibold mb-4">Exam History</h2>
        {sortedResults.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-8 h-8 mb-2 opacity-30 mx-auto" />
            <p>No exams taken yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...sortedResults].reverse().map((r) => {
              const passed = r.percentage >= 50;
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/30"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {r.examTitle || "Untitled Exam"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.subject} · {r.score}/{r.total} correct
                      {r.submittedAt && (
                        <> · {new Date(r.submittedAt.toMillis?.() || Date.now()).toLocaleDateString()}</>
                      )}
                    </p>
                    {r.exitViolation && (
                      <p className="text-xs text-red-400 mt-0.5">
                        ⚠️ Auto-submitted — {r.violationType}
                      </p>
                    )}
                  </div>
                  <span
                    className={`font-bold text-sm px-3 py-1 rounded-full ${
                      passed
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {r.percentage}%
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

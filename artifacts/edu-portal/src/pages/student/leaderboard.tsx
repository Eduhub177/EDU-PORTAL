import { motion } from "framer-motion";
import { Trophy, Crown, Medal } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCollection } from "@/hooks/use-firestore";
import { where } from "firebase/firestore";

interface ResultDoc { id: string; studentId: string; studentName?: string; score: number; }
interface UserDoc { id: string; fullName: string; classLevel: number; role: string; }

export default function StudentLeaderboard() {
  const { user } = useAuth();

  const { data: results, loading: rLoading } = useCollection<ResultDoc>("results");
  const { data: classmates, loading: cLoading } = useCollection<UserDoc>(
    "users",
    where("role", "==", "student"),
    where("classLevel", "==", user?.classLevel || -1),
  );

  const loading = rLoading || cLoading;

  // Compute averages
  const ranked = classmates
    .map((stu) => {
      const myResults = results.filter((r) => r.studentId === stu.id);
      const avg =
        myResults.length > 0
          ? Math.round(myResults.reduce((s, r) => s + (r.score || 0), 0) / myResults.length)
          : 0;
      return { id: stu.id, name: stu.fullName, examsTaken: myResults.length, avg };
    })
    .filter((s) => s.examsTaken > 0)
    .sort((a, b) => b.avg - a.avg);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Trophy className="w-8 h-8 text-amber-500" />
          Class {user?.classLevel} Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">See where you rank among your classmates.</p>
      </div>

      <div className="glass p-6 rounded-2xl min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-center h-60 text-muted-foreground">
            <Trophy className="w-12 h-12 mb-3 opacity-50 animate-pulse" />
            <p>Loading leaderboard…</p>
          </div>
        ) : ranked.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-60 text-muted-foreground">
            <Trophy className="w-12 h-12 mb-3 opacity-50" />
            <p className="font-medium">No results yet</p>
            <p className="text-xs mt-1">Once classmates start taking exams, the leaderboard will fill up here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ranked.map((s, i) => {
              const isMe = s.id === user?.id;
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${isMe ? "bg-primary/15 ring-1 ring-primary/40" : "hover:bg-white/5"}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center font-bold text-lg">
                      {i === 0 ? <Crown className="w-5 h-5 text-amber-400 mx-auto" />
                        : i === 1 ? <Medal className="w-5 h-5 text-slate-300 mx-auto" />
                        : i === 2 ? <Medal className="w-5 h-5 text-orange-400 mx-auto" />
                        : `#${i + 1}`}
                    </span>
                    <div>
                      <p className="font-medium">{s.name} {isMe && <span className="text-xs text-primary ml-1">(you)</span>}</p>
                      <p className="text-xs text-muted-foreground">{s.examsTaken} exam{s.examsTaken === 1 ? "" : "s"}</p>
                    </div>
                  </div>
                  <span className="font-display font-bold text-xl text-primary">{s.avg}%</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

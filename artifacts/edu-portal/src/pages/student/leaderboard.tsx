import { motion } from "framer-motion";
import { Trophy, Crown, Medal, BookOpen } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCollection } from "@/hooks/use-firestore";
import { where } from "firebase/firestore";

interface ResultDoc {
  id: string;
  studentId: string;
  studentName?: string;
  score: number;
  total: number;
  percentage: number;
  subject?: string;
  examTitle?: string;
}

interface UserDoc {
  id: string;
  fullName: string;
  classLevel: number;
  role: string;
}

export default function StudentLeaderboard() {
  const { user } = useAuth();

  const { data: results, loading: rLoading } = useCollection<ResultDoc>("results");
  const { data: classmates, loading: cLoading } = useCollection<UserDoc>(
    "users",
    where("role", "==", "student"),
    where("classLevel", "==", user?.classLevel || -1),
  );

  const loading = rLoading || cLoading;

  // Compute averages using percentage
  const ranked = classmates
    .map((stu) => {
      const myResults = results.filter((r) => r.studentId === stu.id);
      const avg =
        myResults.length > 0
          ? Math.round(
              myResults.reduce((s, r) => s + (r.percentage || 0), 0) /
                myResults.length
            )
          : 0;
      const bestScore = myResults.length > 0
        ? Math.max(...myResults.map((r) => r.percentage || 0))
        : 0;
      return {
        id: stu.id,
        name: stu.fullName,
        examsTaken: myResults.length,
        avg,
        bestScore,
      };
    })
    .filter((s) => s.examsTaken > 0)
    .sort((a, b) => b.avg - a.avg);

  const myRank = ranked.findIndex((s) => s.id === user?.id) + 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Trophy className="w-8 h-8 text-amber-500" />
          Class {user?.classLevel} Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">
          See where you rank among your classmates.
        </p>
      </div>

      {/* My rank card */}
      {myRank > 0 && (
        <div className="glass p-4 rounded-2xl flex items-center justify-between border border-primary/30 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Your Rank</p>
              <p className="text-xs text-muted-foreground">
                {ranked.find((s) => s.id === user?.id)?.examsTaken || 0} exams taken
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-display font-bold text-primary">
              #{myRank}
            </p>
            <p className="text-xs text-muted-foreground">
              out of {ranked.length}
            </p>
          </div>
        </div>
      )}

      {/* Leaderboard */}
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
            <p className="text-xs mt-1">
              Once classmates start taking exams, the leaderboard will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Top 3 podium */}
            {ranked.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {/* 2nd place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`flex flex-col items-center p-4 rounded-xl border mt-4 ${
                    ranked[1].id === user?.id
                      ? "border-primary/40 bg-primary/10"
                      : "border-border bg-background/30"
                  }`}
                >
                  <Medal className="w-6 h-6 text-slate-300 mb-1" />
                  <p className="font-bold text-sm text-center truncate w-full text-center">
                    {ranked[1].name.split(" ")[0]}
                  </p>
                  <p className="text-lg font-display font-bold text-primary">
                    {ranked[1].avg}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ranked[1].examsTaken} exams
                  </p>
                </motion.div>

                {/* 1st place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.0 }}
                  className={`flex flex-col items-center p-4 rounded-xl border ${
                    ranked[0].id === user?.id
                      ? "border-amber-400/40 bg-amber-400/10"
                      : "border-amber-500/30 bg-amber-500/5"
                  }`}
                >
                  <Crown className="w-8 h-8 text-amber-400 mb-1" />
                  <p className="font-bold text-sm text-center truncate w-full text-center">
                    {ranked[0].name.split(" ")[0]}
                  </p>
                  <p className="text-xl font-display font-bold text-amber-400">
                    {ranked[0].avg}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ranked[0].examsTaken} exams
                  </p>
                </motion.div>

                {/* 3rd place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`flex flex-col items-center p-4 rounded-xl border mt-4 ${
                    ranked[2].id === user?.id
                      ? "border-primary/40 bg-primary/10"
                      : "border-border bg-background/30"
                  }`}
                >
                  <Medal className="w-6 h-6 text-orange-400 mb-1" />
                  <p className="font-bold text-sm text-center truncate w-full text-center">
                    {ranked[2].name.split(" ")[0]}
                  </p>
                  <p className="text-lg font-display font-bold text-primary">
                    {ranked[2].avg}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ranked[2].examsTaken} exams
                  </p>
                </motion.div>
              </div>
            )}

            {/* Full list */}
            {ranked.map((s, i) => {
              const isMe = s.id === user?.id;
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isMe
                      ? "bg-primary/15 ring-1 ring-primary/40"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center font-bold text-lg shrink-0">
                      {i === 0 ? (
                        <Crown className="w-5 h-5 text-amber-400 mx-auto" />
                      ) : i === 1 ? (
                        <Medal className="w-5 h-5 text-slate-300 mx-auto" />
                      ) : i === 2 ? (
                        <Medal className="w-5 h-5 text-orange-400 mx-auto" />
                      ) : (
                        `#${i + 1}`
                      )}
                    </span>
                    <div>
                      <p className="font-medium">
                        {s.name}{" "}
                        {isMe && (
                          <span className="text-xs text-primary ml-1">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.examsTaken} exam{s.examsTaken === 1 ? "" : "s"} ·
                        Best: {s.bestScore}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-bold text-xl text-primary">
                      {s.avg}%
                    </span>
                    <p className="text-xs text-muted-foreground">avg</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

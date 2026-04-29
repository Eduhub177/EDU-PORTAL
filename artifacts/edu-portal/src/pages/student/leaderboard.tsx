import { Trophy, Medal, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Leaderboard() {
  const { user } = useAuth();
  
  const dummyLeaders = [
    { rank: 1, name: "Sarah W.", score: 96, exams: 12 },
    { rank: 2, name: "Alex J.", score: 94, exams: 10 },
    { rank: 3, name: "Maria S.", score: 91, exams: 11 },
    { rank: 4, name: "You", score: 84, exams: 5, isMe: true },
    { rank: 5, name: "John D.", score: 82, exams: 8 },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-4xl font-display font-bold mb-2">Class {user?.classLevel} Leaderboard</h1>
        <p className="text-muted-foreground">Top performers in your class. Keep taking exams to climb the ranks!</p>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        {dummyLeaders.map((student, index) => (
          <div 
            key={student.rank} 
            className={`flex items-center gap-4 p-4 sm:p-6 transition-colors border-b border-border/50 last:border-0
              ${student.isMe ? 'bg-primary/10 relative' : 'hover:bg-muted/10'}`
            }
          >
            {student.isMe && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
            
            <div className="w-12 flex-none text-center">
              {student.rank === 1 ? <Medal className="w-8 h-8 text-amber-500 mx-auto" /> :
               student.rank === 2 ? <Medal className="w-8 h-8 text-slate-300 mx-auto" /> :
               student.rank === 3 ? <Medal className="w-8 h-8 text-amber-700 mx-auto" /> :
               <span className="text-xl font-bold text-muted-foreground">#{student.rank}</span>}
            </div>

            <div className="flex-1 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border">
                <span className="font-medium text-sm">{student.name.charAt(0)}</span>
              </div>
              <div>
                <p className={`font-semibold text-lg ${student.isMe ? 'text-primary' : ''}`}>
                  {student.name} {student.isMe && <span className="text-xs font-normal text-primary ml-2">(You)</span>}
                </p>
                <p className="text-sm text-muted-foreground">{student.exams} exams taken</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-display font-bold">{student.score}%</div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

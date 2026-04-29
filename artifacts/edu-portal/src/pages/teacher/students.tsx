import { Link } from "react-router-dom";
import { Search, Filter, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StudentsList() {
  const dummyStudents = [
    { id: "1", name: "Alex Johnson", class: 10, examsTaken: 5, avgScore: 88, bestSubject: "Physics" },
    { id: "2", name: "Maria Smith", class: 10, examsTaken: 4, avgScore: 92, bestSubject: "Mathematics" },
    { id: "3", name: "John Doe", class: 9, examsTaken: 2, avgScore: 75, bestSubject: "Science" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold">Students</h1>
        <p className="text-muted-foreground mt-1">Track progress of students who have taken your exams.</p>
      </div>

      <div className="glass p-4 rounded-2xl flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by student name..." 
            className="pl-9 bg-background/50 border-border"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
            <option value="All">All Classes</option>
            {[6,7,8,9,10,11,12].map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium text-center">Class</th>
                <th className="px-6 py-4 font-medium text-center">Exams Taken</th>
                <th className="px-6 py-4 font-medium text-center">Avg Score</th>
                <th className="px-6 py-4 font-medium text-center">Best Subject</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {dummyStudents.map((student) => (
                <tr key={student.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-base">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">{student.class}</td>
                  <td className="px-6 py-4 text-center">{student.examsTaken}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-primary/10 text-primary font-bold">
                      {student.avgScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">{student.bestSubject}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/teacher/students/${student.id}`}>
                        Details <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

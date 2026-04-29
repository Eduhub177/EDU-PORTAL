import { useState } from "react";
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { subjectColor } from "@/lib/utils";

export default function QuestionBank() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");

  const dummyQuestions = [
    { id: "1", subject: "Physics", topic: "Kinematics", text: "What is the speed of light?" },
    { id: "2", subject: "Mathematics", topic: "Algebra", text: "Solve for x: 2x + 5 = 15" },
    { id: "3", subject: "Science", topic: "Biology", text: "What is the powerhouse of the cell?" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Question Bank</h1>
          <p className="text-muted-foreground mt-1">Manage your reusable questions.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="w-5 h-5 mr-2" />
          Add Question
        </Button>
      </div>

      <div className="glass p-4 rounded-2xl flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search questions by topic or text..." 
            className="pl-9 bg-background/50 border-border"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
          >
            <option value="All">All Subjects</option>
            {user?.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {dummyQuestions.map(q => {
          const color = subjectColor(q.subject);
          return (
            <div key={q.id} className="glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: color.bg, color: color.text }}>
                    {q.subject}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{q.topic}</span>
                </div>
                <p className="font-medium text-lg leading-snug">{q.text}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

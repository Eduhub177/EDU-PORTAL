import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subjectColor } from "@/lib/utils";

export default function MyExams() {
  const dummyExams = [
    { id: "1", title: "Midterm Physics", subject: "Physics", class: 10, status: "published", questions: 25, duration: 45 },
    { id: "2", title: "Algebra Basics", subject: "Mathematics", class: 8, status: "draft", questions: 10, duration: 20 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">My Exams</h1>
          <p className="text-muted-foreground mt-1">Manage your created assessments.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white">
          <Link to="/teacher/create-exam">
            <Plus className="w-5 h-5 mr-2" />
            New Exam
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyExams.map(exam => {
          const color = subjectColor(exam.subject);
          return (
            <div key={exam.id} className="glass p-6 rounded-2xl flex flex-col hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: color.bg, color: color.text }}>
                  {exam.subject}
                </span>
                {exam.status === "published" ? (
                  <span className="flex items-center text-xs text-green-500 font-medium">
                    <Globe className="w-3 h-3 mr-1" /> Published
                  </span>
                ) : (
                  <span className="flex items-center text-xs text-amber-500 font-medium">
                    <Lock className="w-3 h-3 mr-1" /> Draft
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-xl mb-1">{exam.title}</h3>
              <p className="text-sm text-muted-foreground mb-6">Class {exam.class} • {exam.questions} Qs • {exam.duration} mins</p>
              
              <div className="mt-auto flex gap-2">
                <Button variant="outline" className="flex-1" size="sm">
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button variant="outline" className="flex-none text-destructive hover:text-destructive hover:bg-destructive/10" size="sm">
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

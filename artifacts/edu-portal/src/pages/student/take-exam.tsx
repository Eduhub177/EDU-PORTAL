import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Clock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { subjectColor } from "@/lib/utils";

// Dummy exam data
const dummyExam = {
  id: "1",
  title: "Physics Midterm",
  subject: "Physics",
  durationMinutes: 30,
  questions: [
    { id: "q1", text: "What is the speed of light?", options: { A: "3x10^8 m/s", B: "3x10^6 m/s", C: "3x10^10 m/s", D: "3x10^5 m/s" } },
    { id: "q2", text: "Force equals mass times...", options: { A: "Velocity", B: "Acceleration", C: "Time", D: "Distance" } }
  ]
};

export default function TakeExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(dummyExam.durationMinutes * 60);

  const handleStart = () => {
    setStarted(true);
    // In real app, we'd start timer and register visibility handlers
  };

  const handleSelectOption = (opt: string) => {
    setAnswers({ ...answers, [dummyExam.questions[currentQ].id]: opt });
  };

  const handleSubmit = () => {
    toast.success("Exam submitted successfully!");
    navigate("/student/results/dummy");
  };

  if (!started) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-background">
        <div className="glass p-8 rounded-2xl max-w-lg w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold">{dummyExam.title}</h1>
          <p className="text-muted-foreground text-lg">Duration: {dummyExam.durationMinutes} minutes</p>
          
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm text-left flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>Do not switch tabs or leave this window. Doing so will result in an automatic submission and a violation report.</p>
          </div>

          <Button size="lg" className="w-full text-lg h-14 bg-primary hover:bg-primary/90" onClick={handleStart}>
            <Play className="w-5 h-5 mr-2" /> Begin Exam
          </Button>
        </div>
      </div>
    );
  }

  const question = dummyExam.questions[currentQ];
  const isLast = currentQ === dummyExam.questions.length - 1;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="h-16 glass border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="font-display font-bold">EDU PORTAL</div>
        <div className="flex items-center gap-2 font-mono text-lg text-primary">
          <Clock className="w-5 h-5" />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <span className="text-muted-foreground font-medium">Question {currentQ + 1} of {dummyExam.questions.length}</span>
          <div className="flex gap-1">
            {dummyExam.questions.map((_, idx) => (
              <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentQ ? 'bg-primary' : answers[dummyExam.questions[idx].id] ? 'bg-primary/40' : 'bg-border'}`} />
            ))}
          </div>
        </div>

        <motion.div 
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-8 rounded-3xl flex-1 flex flex-col"
        >
          <h2 className="text-2xl font-medium mb-8 leading-relaxed">{question.text}</h2>
          
          <div className="space-y-4 mt-auto">
            {Object.entries(question.options).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handleSelectOption(key)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  answers[question.id] === key 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                  answers[question.id] === key ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {key}
                </span>
                <span className="text-lg">{val}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" size="lg" disabled={currentQ === 0} onClick={() => setCurrentQ(c => c - 1)}>
            Previous
          </Button>
          
          {isLast ? (
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8" onClick={handleSubmit}>
              Submit Exam
            </Button>
          ) : (
            <Button size="lg" onClick={() => setCurrentQ(c => c + 1)}>
              Next Question
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

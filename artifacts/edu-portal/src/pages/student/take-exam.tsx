import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const OPTION_COLORS = {
  A: "border-blue-500/60 bg-blue-500/5",
  B: "border-emerald-500/60 bg-emerald-500/5",
  C: "border-orange-500/60 bg-orange-500/5",
  D: "border-red-500/60 bg-red-500/5",
};
const OPTION_CHIPS = {
  A: "bg-blue-500",
  B: "bg-emerald-500",
  C: "bg-orange-500",
  D: "bg-red-500",
};

interface Question {
  text: string;
  imageUrl?: string;
  options: [string, string, string, string];
  correctIndex: number;
  shuffledOptions?: string[];
  shuffledCorrectIndex?: number;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  classLevel: number;
  duration: number;
  timerEnabled: boolean;
  autoSubmit: boolean;
  examPassword?: string;
  questions: Question[];
  teacherId: string;
  teacherName: string;
}

function seededShuffle<T>(arr: T[], seed: string): T[] {
  const result = [...arr];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  for (let i = result.length - 1; i > 0; i--) {
    hash = ((hash * 1664525) + 1013904223) | 0;
    const j = Math.abs(hash) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function TakeExam() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [needsPassword, setNeedsPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  // Big red alert state
  const [showWarningOverlay, setShowWarningOverlay] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(5);
  const warningTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const violationCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    async function loadExam() {
      if (!examId) { setError("No exam ID provided"); setLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, "exams", examId));
        if (!snap.exists()) { setError("Exam not found"); setLoading(false); return; }
        const data = snap.data() as any;
        if (data.status !== "published") { setError("This exam is not available"); setLoading(false); return; }

        const seed = (user?.id || "anon") + examId;
        const shuffledQuestions = seededShuffle(
          data.questions.map((q: any, origIdx: number) => {
            const opts = [q.options[0], q.options[1], q.options[2], q.options[3]];
            const correctAnswer = opts[q.correctIndex];
            const qSeed = seed + origIdx;
            const shuffledOpts = seededShuffle(opts, qSeed);
            const shuffledCorrectIndex = shuffledOpts.indexOf(correctAnswer);
            return {
              text: q.text || "",
              imageUrl: q.imageUrl || undefined,
              options: opts as [string, string, string, string],
              correctIndex: q.correctIndex,
              shuffledOptions: shuffledOpts,
              shuffledCorrectIndex,
            };
          }),
          seed,
        );

        const examData: Exam = {
          id: snap.id,
          title: data.title || "Untitled Exam",
          subject: data.subject || "",
          classLevel: data.classLevel || 0,
          duration: data.duration || 30,
          timerEnabled: data.timerEnabled ?? true,
          autoSubmit: data.autoSubmit ?? true,
          examPassword: data.examPassword || "",
          questions: shuffledQuestions,
          teacherId: data.teacherId || "",
          teacherName: data.teacherName || "",
        };

        setExam(examData);
        setTimeLeft((data.duration || 30) * 60);
        setNeedsPassword(Boolean(data.examPassword));
      } catch (err) {
        console.error(err);
        setError("Failed to load exam. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [examId, user?.id]);

  useEffect(() => {
    if (!started || !exam?.timerEnabled || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          if (exam.autoSubmit) handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, submitted]);

  // Exit detection with BIG RED ALERT
  useEffect(() => {
    if (!started || submitted) return;

    function handleVisibilityChange() {
      if (document.hidden) {
        violationCountRef.current += 1;
        if (violationCountRef.current >= 2) {
          // Second violation — auto submit
          handleSubmit(true, "Tab switched multiple times");
        } else {
          // First violation — show BIG RED ALERT
          setShowWarningOverlay(true);
          setWarningCountdown(5);
          let count = 5;
          if (warningTimerRef.current) clearInterval(warningTimerRef.current);
          warningTimerRef.current = setInterval(() => {
            count -= 1;
            setWarningCountdown(count);
            if (count <= 0) {
              clearInterval(warningTimerRef.current!);
              setShowWarningOverlay(false);
            }
          }, 1000);
        }
      }
    }

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (warningTimerRef.current) clearInterval(warningTimerRef.current);
    };
  }, [started, submitted]);

  function checkPassword() {
    if (!exam) return;
    if (passwordInput.trim() === exam.examPassword?.trim()) {
      setNeedsPassword(false);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  }

  async function handleSubmit(auto = false, violationType?: string) {
    if (submittedRef.current || !exam || !user) return;
    submittedRef.current = true;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (warningTimerRef.current) clearInterval(warningTimerRef.current);
    setShowWarningOverlay(false);

    try {
      let correct = 0;
      exam.questions.forEach((q, i) => {
        if (answers[i] !== undefined && answers[i] === q.shuffledCorrectIndex) {
          correct++;
        }
      });
      const total = exam.questions.length;
      const percentage = Math.round((correct / total) * 100);

      await addDoc(collection(db, "results"), {
        examId: exam.id,
        examTitle: exam.title,
        subject: exam.subject,
        studentId: user.id,
        studentName: user.fullName,
        studentClass: user.classLevel,
        teacherId: exam.teacherId,
        score: correct,
        total,
        percentage,
        answers,
        autoSubmitted: auto,
        exitViolation: Boolean(violationType),
        violationType: violationType || null,
        submittedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        teacherId: exam.teacherId,
        type: violationType ? "exit_violation" : "exam_submitted",
        studentName: user.fullName,
        studentClass: user.classLevel,
        examTitle: exam.title,
        examId: exam.id,
        score: correct,
        total,
        percentage,
        exitViolation: Boolean(violationType),
        violationType: violationType || null,
        read: false,
        createdAt: serverTimestamp(),
      });

      setScore({ correct, total });
      setSubmitted(true);

      if (auto) {
        toast.error("⚠️ Exam auto-submitted due to exit violation");
      } else {
        toast.success("✅ Exam submitted successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit. Please try again.");
      submittedRef.current = false;
      setSubmitting(false);
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !exam) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4">
        <div className="glass p-8 rounded-2xl max-w-md w-full text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold">Exam Unavailable</h2>
          <p className="text-muted-foreground">{error || "Something went wrong"}</p>
          <Button onClick={() => navigate("/student/exams")}>Back to Exams</Button>
        </div>
      </div>
    );
  }

  // Password
  if (needsPassword) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 rounded-2xl max-w-md w-full space-y-5"
        >
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold">{exam.title}</h1>
            <p className="text-muted-foreground text-sm">
              This exam is password protected. Enter the password given by your teacher.
            </p>
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter exam password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkPassword()}
            />
            {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
          </div>
          <Button className="w-full" onClick={checkPassword}>Enter Exam</Button>
        </motion.div>
      </div>
    );
  }

  // Results
  if (submitted && score) {
    const percentage = Math.round((score.correct / score.total) * 100);
    const passed = percentage >= 50;
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 rounded-2xl max-w-2xl w-full space-y-6"
        >
          <div className="text-center space-y-3">
            {passed
              ? <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
              : <AlertTriangle className="w-16 h-16 text-red-400 mx-auto" />}
            <h1 className="text-3xl font-display font-bold">
              {passed ? "🎉 Congratulations!" : "Better luck next time!"}
            </h1>
            <p className="text-5xl font-bold text-primary">{percentage}%</p>
            <p className="text-muted-foreground">
              You scored {score.correct} out of {score.total} questions correctly
            </p>
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
              passed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
            }`}>
              {passed ? "✅ PASSED" : "❌ FAILED"}
            </span>
          </div>
          <div className="space-y-3 max-h-[40vh] overflow-y-auto">
            <h3 className="font-semibold">Question Review:</h3>
            {exam.questions.map((q, i) => {
              const studentAnswer = answers[i];
              const isCorrect = studentAnswer === q.shuffledCorrectIndex;
              const shuffled = q.shuffledOptions || q.options;
              return (
                <div key={i} className={`p-4 rounded-xl border ${
                  isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"
                }`}>
                  <p className="font-medium text-sm mb-2">Q{i + 1}. {q.text}</p>
                  {q.imageUrl && <img src={q.imageUrl} alt="" className="max-h-32 rounded-lg mb-2 object-contain" />}
                  <div className="space-y-1 text-sm">
                    {shuffled.map((opt, oi) => (
                      <p key={oi} className={
                        oi === q.shuffledCorrectIndex ? "text-emerald-400 font-medium"
                        : studentAnswer === oi && !isCorrect ? "text-red-400"
                        : "text-muted-foreground"
                      }>
                        {OPTION_LABELS[oi]}. {opt}
                        {oi === q.shuffledCorrectIndex && " ✓ Correct"}
                        {studentAnswer === oi && !isCorrect && " ✗ Your answer"}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <Button className="w-full" onClick={() => navigate("/student")}>
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  // Pre-exam instructions
  if (!started) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-2xl max-w-lg w-full text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">{exam.title}</h1>
            <p className="text-muted-foreground mt-1">{exam.subject} · Class {exam.classLevel}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="glass p-3 rounded-xl">
              <p className="text-muted-foreground">Questions</p>
              <p className="font-bold text-lg">{exam.questions.length}</p>
            </div>
            <div className="glass p-3 rounded-xl">
              <p className="text-muted-foreground">Duration</p>
              <p className="font-bold text-lg">
                {exam.timerEnabled ? `${exam.duration} min` : "No limit"}
              </p>
            </div>
          </div>
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm text-left flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              Do not switch tabs or leave this window during the exam.
              Violations will be reported to your teacher and may result
              in automatic submission.
            </p>
          </div>
          <Button
            size="lg"
            className="w-full text-lg h-14 bg-primary hover:bg-primary/90"
            onClick={() => setStarted(true)}
          >
            <Play className="w-5 h-5 mr-2" /> Give Exam
          </Button>
        </motion.div>
      </div>
    );
  }

  // Exam screen
  const question = exam.questions[currentQ];
  const shuffledOpts = question.shuffledOptions || question.options;
  const isLast = currentQ === exam.questions.length - 1;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerRed = timeLeft < 60;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative">

      {/* ===== BIG RED WARNING OVERLAY ===== */}
      <AnimatePresence>
        {showWarningOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backgroundColor: "rgba(185, 28, 28, 0.97)" }}
          >
            {/* Pulsing border effect */}
            <div className="absolute inset-0 border-8 border-red-400 animate-pulse rounded-none" />

            <div className="text-center text-white px-8 space-y-6 max-w-2xl mx-auto relative z-10">
              {/* Big warning icon */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="flex justify-center"
              >
                <AlertTriangle className="w-32 h-32 text-yellow-300 drop-shadow-lg" />
              </motion.div>

              {/* Warning text */}
              <div className="space-y-3">
                <h1 className="text-6xl font-display font-black tracking-wide">
                  ⚠️ WARNING!
                </h1>
                <h2 className="text-3xl font-bold">
                  Do not leave the exam window!
                </h2>
                <p className="text-xl text-red-200">
                  This violation has been recorded and reported to your teacher.
                </p>
                <p className="text-lg text-red-200 font-medium">
                  Switching tabs again will automatically submit your exam.
                </p>
              </div>

              {/* Countdown */}
              <div className="space-y-2">
                <p className="text-red-200 text-lg">Returning to exam in</p>
                <motion.div
                  key={warningCountdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-8xl font-black text-yellow-300"
                >
                  {warningCountdown}
                </motion.div>
              </div>

              {/* Manual close button */}
              <button
                onClick={() => {
                  if (warningTimerRef.current) clearInterval(warningTimerRef.current);
                  setShowWarningOverlay(false);
                }}
                className="px-8 py-3 bg-white text-red-700 font-bold rounded-xl text-lg hover:bg-red-50 transition-colors"
              >
                Return to Exam
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-16 glass border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="font-display font-bold text-sm md:text-base">{exam.title}</div>
        {exam.timerEnabled && (
          <div className={`flex items-center gap-2 font-mono text-lg font-bold px-3 py-1 rounded-lg transition-colors ${
            timerRed ? "text-red-400 bg-red-500/10 animate-pulse" : "text-primary"
          }`}>
            <Clock className="w-5 h-5" />
            {mins}:{secs.toString().padStart(2, "0")}
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl flex flex-col gap-6">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm font-medium">
            Question {currentQ + 1} of {exam.questions.length}
          </span>
          <div className="flex gap-1">
            {exam.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQ(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  idx === currentQ ? "bg-primary scale-125"
                  : answers[idx] !== undefined ? "bg-primary/40"
                  : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="glass p-6 md:p-8 rounded-3xl flex-1 flex flex-col gap-6"
          >
            {question.imageUrl && (
              <img
                src={question.imageUrl}
                alt="Question"
                className="max-h-60 rounded-xl object-contain border border-border"
              />
            )}
            <h2 className="text-xl md:text-2xl font-medium leading-relaxed">
              {question.text}
            </h2>
            <div className="space-y-3 mt-auto">
              {shuffledOpts.map((opt, i) => {
                const lbl = OPTION_LABELS[i];
                const isSelected = answers[currentQ] === i;
                return (
                  <button
                    key={i}
                    onClick={() => setAnswers((prev) => ({ ...prev, [currentQ]: i }))}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                        : `${OPTION_COLORS[lbl]} hover:border-primary/50`
                    }`}
                  >
                    <span className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white ${
                      isSelected ? "bg-primary" : OPTION_CHIPS[lbl]
                    }`}>
                      {lbl}
                    </span>
                    <span className="text-base">{opt}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="lg"
            disabled={currentQ === 0}
            onClick={() => setCurrentQ((c) => c - 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          {isLast ? (
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              onClick={() => {
                const unanswered = exam.questions.length - Object.keys(answers).length;
                if (unanswered > 0) {
                  toast.error(`You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Submitting in 3 seconds...`);
                  setTimeout(() => handleSubmit(false), 3000);
                } else {
                  handleSubmit(false);
                }
              }}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Submit Exam ✓
            </Button>
          ) : (
            <Button size="lg" onClick={() => setCurrentQ((c) => c + 1)}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Camera, Image as ImageIcon, CheckCircle2,
  Loader2, Plus, Save, Send, Trash2, Timer, ChevronLeft, ChevronRight,
  ListChecks, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { db, storage } from "@/lib/firebase";
import {
  doc, setDoc, updateDoc, serverTimestamp, getDoc, collection,
} from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { SUBJECTS, CLASS_LEVELS } from "@/lib/constants";

const DURATION_PRESETS = [10, 15, 30, 45, 60, 90, 120];
const COUNT_PRESETS = [5, 10, 15, 20, 25, 30];
const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const OPTION_COLORS: Record<string, { border: string; bg: string; chip: string }> = {
  A: { border: "border-blue-500/60",   bg: "bg-blue-500/5",   chip: "bg-blue-500" },
  B: { border: "border-emerald-500/60",bg: "bg-emerald-500/5",chip: "bg-emerald-500" },
  C: { border: "border-orange-500/60", bg: "bg-orange-500/5", chip: "bg-orange-500" },
  D: { border: "border-red-500/60",    bg: "bg-red-500/5",    chip: "bg-red-500" },
};

interface Question {
  text: string;
  imageUrl?: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3 | -1;
}

function blankQuestion(): Question {
  return { text: "", options: ["", "", "", ""], correctIndex: -1 };
}

export default function CreateExam() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const examId = params.get("id");

  // ───── Header form ─────
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [classLevel, setClassLevel] = useState<number>(9);

  // ───── Timer ─────
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [duration, setDuration] = useState(30);
  const [autoSubmit, setAutoSubmit] = useState(true);

  // ───── Questions ─────
  const [questions, setQuestions] = useState<Question[]>([blankQuestion()]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [customCount, setCustomCount] = useState<string>("");

  // ───── Save state ─────
  const [docId, setDocId] = useState<string | null>(examId);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hydrating, setHydrating] = useState<boolean>(Boolean(examId));
  const skipNextSaveRef = useRef<boolean>(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ───── Load draft ─────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!examId) {
        setHydrating(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "exams", examId));
        if (cancelled) return;
        if (!snap.exists()) {
          toast.error("Exam not found");
          setHydrating(false);
          return;
        }
        const d = snap.data() as any;
        skipNextSaveRef.current = true;
        setTitle(d.title || "");
        setSubject(d.subject || SUBJECTS[0]);
        setClassLevel(d.classLevel || 9);
        setTimerEnabled(d.timerEnabled ?? true);
        setDuration(d.duration ?? 30);
        setAutoSubmit(d.autoSubmit ?? true);
        if (Array.isArray(d.questions) && d.questions.length > 0) {
          setQuestions(
            d.questions.map((q: any) => ({
              text: q.text || "",
              imageUrl: q.imageUrl,
              options: [q.options?.[0] || "", q.options?.[1] || "", q.options?.[2] || "", q.options?.[3] || ""],
              correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : -1,
            })),
          );
        }
        setDocId(examId);
        setLastSaved(d.updatedAt?.toDate?.() || new Date());
      } catch (err) {
        console.error(err);
        toast.error("Failed to load draft");
      } finally {
        if (!cancelled) setHydrating(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [examId]);

  // ───── Auto-save (debounced) ─────
  useEffect(() => {
    if (hydrating) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    if (!user) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveState("idle");

    saveTimerRef.current = setTimeout(async () => {
      try {
        setSaveState("saving");
        const payload = {
          title: title.trim(),
          subject,
          classLevel,
          status: "draft" as const,
          timerEnabled,
          duration,
          autoSubmit,
          questions,
          teacherId: user.id,
          teacherName: user.fullName,
          updatedAt: serverTimestamp(),
        };
        if (!docId) {
          const ref = doc(collection(db, "exams"));
          await setDoc(ref, { ...payload, createdAt: serverTimestamp() });
          setDocId(ref.id);
          // Reflect in URL so reloads keep editing same draft
          const next = new URLSearchParams(params);
          next.set("id", ref.id);
          setParams(next, { replace: true });
        } else {
          await updateDoc(doc(db, "exams", docId), payload);
        }
        setSaveState("saved");
        setLastSaved(new Date());
      } catch (err) {
        console.error("autosave failed", err);
        setSaveState("idle");
        toast.error("Auto-save failed");
      }
    }, 1500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subject, classLevel, timerEnabled, duration, autoSubmit, questions, hydrating]);

  // ───── Question helpers ─────
  function setCount(n: number) {
    const safe = Math.max(1, Math.min(100, n));
    setQuestions((prev) => {
      if (safe > prev.length) {
        return [...prev, ...Array.from({ length: safe - prev.length }, blankQuestion)];
      }
      if (safe < prev.length) {
        return prev.slice(0, safe);
      }
      return prev;
    });
    if (currentSlide >= safe) setCurrentSlide(safe - 1);
  }

  function updateQuestion(i: number, patch: Partial<Question>) {
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }

  function updateOption(qi: number, oi: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qi
          ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) as Question["options"] }
          : q,
      ),
    );
  }

  // ───── Image upload ─────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploadingForIndex, setUploadingForIndex] = useState<number | null>(null);

  async function handleImageFile(qIndex: number, file: File) {
    if (!file) return;
    if (!docId && !user) {
      toast.error("Add a title first so we can save the image");
      return;
    }
    try {
      setUploadingForIndex(qIndex);
      const path = `exams/${docId || "tmp-" + user!.id}/q${qIndex}-${Date.now()}-${file.name}`;
      const ref = storageRef(storage, path);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      updateQuestion(qIndex, { imageUrl: url });
      toast.success("Image added");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed — make sure Storage rules allow writes");
    } finally {
      setUploadingForIndex(null);
    }
  }

  // ───── Publish / save flow ─────
  async function publishNow() {
    if (!docId) {
      toast.error("Wait a moment for the draft to save first");
      return;
    }
    if (!title.trim()) {
      toast.error("Add a title before publishing");
      return;
    }
    const incomplete = questions.findIndex(
      (q) => !q.text.trim() || q.options.some((o) => !o.trim()) || q.correctIndex < 0,
    );
    if (incomplete >= 0) {
      toast.error(`Question ${incomplete + 1} is incomplete — fill text, all 4 options, and pick the correct answer.`);
      setCurrentSlide(incomplete);
      setShowReview(false);
      return;
    }
    try {
      await updateDoc(doc(db, "exams", docId), {
        status: "published",
        publishedAt: serverTimestamp(),
      });
      toast.success("🎉 Exam published");
      navigate("/teacher/exams");
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish");
    }
  }

  // ───── Render ─────
  const totalQuestions = questions.length;
  const isLastSlide = currentSlide === totalQuestions - 1;
  const q = questions[currentSlide];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button asChild variant="ghost" size="sm">
          <Link to="/teacher/exams"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <SaveIndicator state={saveState} lastSaved={lastSaved} />
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-display font-bold">
          {examId ? "Edit Exam" : "Create New Exam"}
        </h1>
        <p className="text-muted-foreground mt-1">Drafts auto-save as you type.</p>
      </div>

      {/* ───── Exam Settings ───── */}
      <div className="glass p-6 rounded-2xl space-y-5">
        <h2 className="font-display font-semibold text-lg">Exam Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mid-term Algebra Test" data-testid="input-exam-title" />
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              data-testid="select-subject"
            >
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Class Level</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={classLevel}
              onChange={(e) => setClassLevel(parseInt(e.target.value, 10))}
              data-testid="select-class"
            >
              {CLASS_LEVELS.map((c) => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
        </div>

        {/* Timer panel */}
        <div className="rounded-xl border border-border/50 p-4 space-y-3 bg-background/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-primary" />
              <Label className="text-base">Timer</Label>
            </div>
            <Switch checked={timerEnabled} onCheckedChange={setTimerEnabled} data-testid="switch-timer" />
          </div>
          {timerEnabled && (
            <>
              <div className="flex flex-wrap gap-2">
                {DURATION_PRESETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDuration(m)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      duration === m ? "bg-primary text-white border-primary" : "border-border hover:border-primary/50"
                    }`}
                    data-testid={`preset-${m}`}
                  >
                    {m} min
                  </button>
                ))}
                <Input
                  type="number"
                  min={1}
                  className="w-24 h-8 text-xs"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value || "1", 10)))}
                />
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border/30">
                <span className="text-muted-foreground">Auto-submit when time runs out</span>
                <Switch checked={autoSubmit} onCheckedChange={setAutoSubmit} data-testid="switch-autosubmit" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ───── Question count ───── */}
      <div className="glass p-5 rounded-2xl">
        <Label className="mb-3 block">How many questions?</Label>
        <div className="flex flex-wrap gap-2">
          {COUNT_PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => { setCustomCount(""); setCount(n); }}
              className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                totalQuestions === n && !customCount
                  ? "bg-accent text-accent-foreground border-accent"
                  : "border-border hover:border-accent/50"
              }`}
              data-testid={`count-${n}`}
            >
              {n}
            </button>
          ))}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={100}
              placeholder="Custom"
              className="w-28 h-10"
              value={customCount}
              onChange={(e) => setCustomCount(e.target.value)}
              onBlur={() => {
                if (customCount) {
                  const n = parseInt(customCount, 10);
                  if (n >= 1) setCount(n);
                }
              }}
              data-testid="input-custom-count"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Currently <span className="font-medium text-foreground">{totalQuestions}</span> question{totalQuestions === 1 ? "" : "s"}.
        </p>
      </div>

      {/* ───── Slide nav ───── */}
      {!showReview && (
        <>
          <div className="glass p-4 rounded-2xl flex items-center gap-3 sticky top-2 z-20 backdrop-blur">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
              disabled={currentSlide === 0}
              data-testid="button-prev-slide"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>

            <div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto py-1">
              {questions.map((qq, i) => {
                const filled = qq.text.trim() && qq.options.every((o) => o.trim()) && qq.correctIndex >= 0;
                const isCurrent = i === currentSlide;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`shrink-0 w-7 h-7 rounded-full text-[11px] font-medium border transition-all ${
                      isCurrent
                        ? "bg-primary text-white border-primary scale-110"
                        : filled
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : "bg-background border-border text-muted-foreground hover:border-primary/40"
                    }`}
                    aria-label={`Go to question ${i + 1}`}
                    data-testid={`dot-${i}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {isLastSlide ? (
              <Button
                size="sm"
                onClick={() => setShowReview(true)}
                className="bg-gradient-to-r from-primary to-accent text-white"
                data-testid="button-review"
              >
                <ListChecks className="w-4 h-4 mr-1" /> Review & Publish
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setCurrentSlide((s) => Math.min(totalQuestions - 1, s + 1))}
                data-testid="button-next-slide"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {/* ───── Slide editor ───── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="glass p-6 rounded-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-lg">Question {currentSlide + 1} of {totalQuestions}</h3>
                <Badge variant="outline">{q.correctIndex >= 0 ? `Answer: ${OPTION_LABELS[q.correctIndex as 0 | 1 | 2 | 3]}` : "No answer"}</Badge>
              </div>

              <div className="space-y-1.5">
                <Label>Question text</Label>
                <Textarea
                  value={q.text}
                  onChange={(e) => updateQuestion(currentSlide, { text: e.target.value })}
                  placeholder="Type the question…"
                  rows={3}
                  data-testid={`input-question-${currentSlide}`}
                />
              </div>

              {/* Image */}
              <div className="space-y-2">
                <Label>Image (optional)</Label>
                {q.imageUrl ? (
                  <div className="relative inline-block">
                    <img src={q.imageUrl} alt="" className="max-h-60 rounded-lg border border-border" />
                    <button
                      type="button"
                      onClick={() => updateQuestion(currentSlide, { imageUrl: undefined })}
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"
                      data-testid="button-remove-image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingForIndex === currentSlide}
                      data-testid="button-choose-library"
                    >
                      {uploadingForIndex === currentSlide
                        ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        : <ImageIcon className="w-4 h-4 mr-2" />}
                      Choose from Library
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={uploadingForIndex === currentSlide}
                      data-testid="button-take-photo"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageFile(currentSlide, f);
                        e.target.value = "";
                      }}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageFile(currentSlide, f);
                        e.target.value = "";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Options A/B/C/D */}
              <div className="space-y-2">
                <Label>Options — tap the radio to mark the correct answer</Label>
                <div className="space-y-2">
                  {(OPTION_LABELS).map((lbl, i) => {
                    const colors = OPTION_COLORS[lbl];
                    const isCorrect = q.correctIndex === i;
                    return (
                      <div
                        key={lbl}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${colors.border} ${colors.bg} ${
                          isCorrect ? "ring-2 ring-emerald-400 shadow-[0_0_18px_rgba(34,197,94,0.45)]" : ""
                        }`}
                        data-testid={`option-row-${i}`}
                      >
                        <span className={`shrink-0 w-9 h-9 rounded-lg ${colors.chip} text-white font-bold flex items-center justify-center`}>
                          {lbl}
                        </span>
                        <Input
                          value={q.options[i]}
                          onChange={(e) => updateOption(currentSlide, i, e.target.value)}
                          placeholder={`Option ${lbl}`}
                          className="flex-1 bg-background/60"
                          data-testid={`input-option-${i}`}
                        />
                        <button
                          type="button"
                          onClick={() => updateQuestion(currentSlide, { correctIndex: i as 0 | 1 | 2 | 3 })}
                          aria-label={`Mark ${lbl} as correct`}
                          data-testid={`radio-correct-${i}`}
                          className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCorrect
                              ? "border-emerald-400 bg-emerald-500/20"
                              : "border-border hover:border-emerald-400/60"
                          }`}
                        >
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {/* ───── Review screen ───── */}
      {showReview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl space-y-5"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-display font-semibold text-xl">Review</h2>
              <p className="text-sm text-muted-foreground">Double-check your exam before publishing.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowReview(false)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to editor
            </Button>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {questions.map((qq, i) => {
              const incomplete = !qq.text.trim() || qq.options.some((o) => !o.trim()) || qq.correctIndex < 0;
              return (
                <div key={i} className={`p-4 rounded-xl border ${incomplete ? "border-red-500/40 bg-red-500/5" : "border-border bg-background/30"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">Q{i + 1}. {qq.text || <span className="text-red-400">— missing —</span>}</p>
                    <button
                      onClick={() => { setCurrentSlide(i); setShowReview(false); }}
                      className="text-xs text-primary hover:underline shrink-0"
                    >
                      edit
                    </button>
                  </div>
                  {qq.imageUrl && <img src={qq.imageUrl} alt="" className="mt-2 max-h-32 rounded-lg" />}
                  <ul className="mt-2 space-y-1 text-sm">
                    {qq.options.map((o, oi) => (
                      <li key={oi} className={qq.correctIndex === oi ? "text-emerald-400 font-medium" : "text-muted-foreground"}>
                        {OPTION_LABELS[oi]}. {o || <span className="text-red-400">missing</span>} {qq.correctIndex === oi && "✓"}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 flex-wrap pt-2 border-t border-border/30">
            <Button asChild variant="outline">
              <Link to="/teacher/exams">
                <Save className="w-4 h-4 mr-1" /> Save as Draft & Exit
              </Link>
            </Button>
            <Button
              onClick={publishNow}
              className="bg-emerald-600 hover:bg-emerald-700 text-white ml-auto"
              data-testid="button-publish-now"
            >
              <Send className="w-4 h-4 mr-1" /> Publish Now
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SaveIndicator({ state, lastSaved }: { state: "idle" | "saving" | "saved"; lastSaved: Date | null }) {
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
      </span>
    );
  }
  if (state === "saved" || lastSaved) {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Saved {lastSaved ? `· ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "✓"}
      </span>
    );
  }
  return <span className="text-muted-foreground">Unsaved</span>;
}

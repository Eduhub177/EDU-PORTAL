import { useState } from "react";
import { Plus, Save, Send, Clock, Trash2, ArrowUpDown, Infinity as InfinityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TIMER_PRESETS = [10, 15, 30, 45, 60, 90, 120];

function formatDuration(mins: number): string {
  if (!mins || mins <= 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export default function CreateExam() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(user?.subjects?.[0] || "");
  const [classLevel, setClassLevel] = useState("9");
  const [duration, setDuration] = useState("30");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [passingPercent, setPassingPercent] = useState("40");
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);

  const handleSaveDraft = () => {
    toast.success("Draft saved successfully!");
  };

  const handlePublish = () => {
    if (!title || questions.length === 0) {
      toast.error("Please add a title and at least one question.");
      return;
    }
    toast.success("Exam published successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Create Exam</h1>
          <p className="text-muted-foreground mt-1">Design a new assessment for your students.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} className="glass">
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={handlePublish} className="bg-primary hover:bg-primary/90 text-white">
            <Send className="w-4 h-4 mr-2" /> Publish Exam
          </Button>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Exam Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Midterm Physics" />
        </div>
        <div className="space-y-2">
          <Label>Subject</Label>
          <select 
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={subject} onChange={e => setSubject(e.target.value)}
          >
            {user?.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Target Class</Label>
          <select 
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={classLevel} onChange={e => setClassLevel(e.target.value)}
          >
            {[6,7,8,9,10,11,12].map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Passing Percentage (%)</Label>
          <Input type="number" value={passingPercent} onChange={e => setPassingPercent(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Exam Password (for students)</Label>
          <Input value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank for open exam" />
        </div>

        <div className="md:col-span-2 mt-2 p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${timerEnabled ? "bg-primary/20 text-primary animate-glow-pulse" : "bg-muted text-muted-foreground"}`}>
                {timerEnabled ? <Clock className="w-5 h-5" /> : <InfinityIcon className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-semibold">{timerEnabled ? "Timed Exam" : "Untimed Exam"}</p>
                <p className="text-xs text-muted-foreground">
                  {timerEnabled
                    ? `Students get ${formatDuration(parseInt(duration) || 0)} to finish`
                    : "Students can take as long as they want"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="timer-toggle" className="text-sm cursor-pointer">Enable timer</Label>
              <Switch
                id="timer-toggle"
                checked={timerEnabled}
                onCheckedChange={setTimerEnabled}
                data-testid="switch-timer-enabled"
              />
            </div>
          </div>

          {timerEnabled && (
            <>
              <div className="space-y-2">
                <Label>Duration (Minutes)</Label>
                <div className="flex flex-wrap gap-2">
                  {TIMER_PRESETS.map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setDuration(String(min))}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-all hover-elevate ${
                        parseInt(duration) === min
                          ? "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_rgba(124,58,237,0.5)]"
                          : "border-border bg-background/50 text-muted-foreground hover:text-foreground"
                      }`}
                      data-testid={`button-preset-${min}`}
                    >
                      {formatDuration(min)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    type="number"
                    min={1}
                    max={600}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-32"
                    data-testid="input-duration"
                  />
                  <span className="text-sm text-muted-foreground">
                    minutes total · <span className="text-foreground font-medium">{formatDuration(parseInt(duration) || 0)}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Auto-submit when time runs out</p>
                  <p className="text-xs text-muted-foreground">Recommended for fair grading</p>
                </div>
                <Switch
                  checked={autoSubmit}
                  onCheckedChange={setAutoSubmit}
                  data-testid="switch-auto-submit"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <Tabs defaultValue="add-new" className="w-full">
          <div className="border-b border-border/50 px-6 py-2 bg-muted/20">
            <TabsList>
              <TabsTrigger value="add-new">Add New Question</TabsTrigger>
              <TabsTrigger value="bank">Pick from Bank</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="add-new" className="p-6 m-0">
             <div className="space-y-4">
                <Textarea placeholder="Type your question here..." className="min-h-[100px]" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Option A" className="border-blue-500/50 focus-visible:ring-blue-500" />
                  <Input placeholder="Option B" className="border-green-500/50 focus-visible:ring-green-500" />
                  <Input placeholder="Option C" className="border-orange-500/50 focus-visible:ring-orange-500" />
                  <Input placeholder="Option D" className="border-red-500/50 focus-visible:ring-red-500" />
                </div>
                <Button className="w-full" variant="secondary"><Plus className="w-4 h-4 mr-2"/> Add to Exam</Button>
             </div>
          </TabsContent>
          <TabsContent value="bank" className="p-6 m-0 text-center text-muted-foreground">
             Question bank integration coming soon...
          </TabsContent>
        </Tabs>
      </div>

      {questions.length === 0 && (
        <div className="text-center p-8 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
          No questions added yet. Start by adding a new question above.
        </div>
      )}
    </div>
  );
}

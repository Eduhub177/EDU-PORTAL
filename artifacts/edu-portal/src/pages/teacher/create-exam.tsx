import { useState } from "react";
import { Plus, Save, Send, Clock, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreateExam() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(user?.subjects?.[0] || "");
  const [classLevel, setClassLevel] = useState("9");
  const [duration, setDuration] = useState("30");
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
          <Label>Duration (Minutes)</Label>
          <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Passing Percentage (%)</Label>
          <Input type="number" value={passingPercent} onChange={e => setPassingPercent(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Exam Password (for students)</Label>
          <Input value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank for open exam" />
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

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, FileText, Edit3, Send, Trash2, ArchiveRestore, FolderOpen, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth";
import { useCollection } from "@/hooks/use-firestore";
import { db } from "@/lib/firebase";
import {
  where, doc, updateDoc, deleteDoc, serverTimestamp,
  collection, query, getDocs,
} from "firebase/firestore";
import { toast } from "sonner";
import { subjectColor } from "@/lib/utils";

interface ExamDoc {
  id: string;
  title: string;
  subject: string;
  classLevel: number;
  status: "draft" | "published";
  duration?: number;
  questions?: any[];
  createdAt?: any;
  publishedAt?: any;
  teacherId: string;
}

export default function TeacherExams() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"draft" | "published">("draft");

  const { data: exams, loading } = useCollection<ExamDoc>(
    "exams",
    where("teacherId", "==", user?.id || "_none_"),
  );

  const drafts = exams.filter((e) => e.status === "draft");
  const published = exams.filter((e) => e.status === "published");

  async function publishExam(exam: ExamDoc) {
    if (!exam.questions || exam.questions.length === 0) {
      toast.error("Cannot publish — add at least one question first.");
      return;
    }
    try {
      await updateDoc(doc(db, "exams", exam.id), {
        status: "published",
        publishedAt: serverTimestamp(),
      });
      toast.success("Exam published");
      setTab("published");
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish");
    }
  }

  async function moveToDraft(exam: ExamDoc) {
    try {
      await updateDoc(doc(db, "exams", exam.id), {
        status: "draft",
      });
      toast.success("Moved back to drafts");
      setTab("draft");
    } catch (err) {
      console.error(err);
      toast.error("Failed to move to draft");
    }
  }

  async function deleteExamCascade(exam: ExamDoc) {
    try {
      // Cascade: delete all results for this exam
      const resultsQuery = query(
        collection(db, "results"),
        where("examId", "==", exam.id),
      );
      const resSnap = await getDocs(resultsQuery);
      await Promise.all(resSnap.docs.map((d) => deleteDoc(d.ref)));

      await deleteDoc(doc(db, "exams", exam.id));
      toast.success(`Deleted "${exam.title}"${resSnap.size > 0 ? ` (and ${resSnap.size} result${resSnap.size === 1 ? "" : "s"})` : ""}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">My Exams</h1>
          <p className="text-muted-foreground mt-1">Manage drafts and published exams.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white">
          <Link to="/teacher/create-exam" data-testid="button-new-exam">
            <Plus className="w-4 h-4 mr-2" /> New Exam
          </Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="draft" data-testid="tab-drafts">
            <FolderOpen className="w-4 h-4 mr-2" />
            Drafts {drafts.length > 0 && <Badge variant="secondary" className="ml-2">{drafts.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="published" data-testid="tab-published">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Published {published.length > 0 && <Badge variant="secondary" className="ml-2">{published.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draft" className="mt-6">
          <ExamList
            loading={loading}
            exams={drafts}
            emptyText="No drafts yet — start a new exam to save one."
            renderActions={(exam) => (
              <>
                <Button asChild size="sm" variant="outline" data-testid={`button-edit-${exam.id}`}>
                  <Link to={`/teacher/create-exam?id=${exam.id}`}>
                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => publishExam(exam)}
                  data-testid={`button-publish-${exam.id}`}
                >
                  <Send className="w-3.5 h-3.5 mr-1" /> Publish
                </Button>
                <DeleteButton exam={exam} onConfirm={() => deleteExamCascade(exam)} />
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          <ExamList
            loading={loading}
            exams={published}
            emptyText="No published exams yet — publish a draft to make it available to students."
            renderActions={(exam) => (
              <>
                <Button asChild size="sm" variant="outline" data-testid={`button-view-${exam.id}`}>
                  <Link to={`/teacher/create-exam?id=${exam.id}`}>
                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => moveToDraft(exam)}
                  data-testid={`button-unpublish-${exam.id}`}
                >
                  <ArchiveRestore className="w-3.5 h-3.5 mr-1" /> Move to Draft
                </Button>
                <DeleteButton exam={exam} onConfirm={() => deleteExamCascade(exam)} />
              </>
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ExamList({
  loading, exams, emptyText, renderActions,
}: {
  loading: boolean;
  exams: ExamDoc[];
  emptyText: string;
  renderActions: (exam: ExamDoc) => React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="glass p-12 rounded-2xl text-center text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50 animate-pulse" />
        <p>Loading…</p>
      </div>
    );
  }
  if (exams.length === 0) {
    return (
      <div className="glass p-12 rounded-2xl text-center text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">Nothing here yet</p>
        <p className="text-xs mt-1">{emptyText}</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {exams.map((exam, i) => {
        const sc = subjectColor(exam.subject);
        return (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 justify-between"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge style={{ backgroundColor: sc.bg, color: sc.text }} className="border-0">
                  {exam.subject}
                </Badge>
                <Badge variant="outline" className="text-xs">Class {exam.classLevel}</Badge>
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {exam.questions?.length || 0} q
                </span>
                {exam.duration ? (
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {exam.duration} min
                  </span>
                ) : null}
              </div>
              <h3 className="font-display font-semibold text-lg mt-2">{exam.title || "(Untitled)"}</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">{renderActions(exam)}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

function DeleteButton({ exam, onConfirm }: { exam: ExamDoc; onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" data-testid={`button-delete-${exam.id}`}>
          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{exam.title || "Untitled"}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the exam and all student results for it. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

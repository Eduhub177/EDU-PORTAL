import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import Footer from "@/components/footer";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import NotFound from "@/pages/not-found";
import { ProtectedRoute, RoleRoute } from "@/components/protected-route";
import TeacherLayout from "@/components/layout/teacher-layout";
import StudentLayout from "@/components/layout/student-layout";

import TeacherHome from "@/pages/teacher/home";
import QuestionBank from "@/pages/teacher/inventory";
import CreateExam from "@/pages/teacher/create-exam";
import MyExams from "@/pages/teacher/exams";
import StudentsList from "@/pages/teacher/students";
import StudentDetail from "@/pages/teacher/student-detail";

import StudentHome from "@/pages/student/home";
import StudentExams from "@/pages/student/exams";
import StudentProgress from "@/pages/student/progress";
import Leaderboard from "@/pages/student/leaderboard";
import TakeExam from "@/pages/student/take-exam";
import ResultDetail from "@/pages/student/result-detail";

const queryClient = new QueryClient();

function FirebaseWarning() {
  if (isFirebaseConfigured) return null;
  return (
    <div className="bg-destructive/90 text-destructive-foreground px-4 py-2 text-center text-sm font-medium z-50 relative">
      Firebase is not configured. Real-time features are disabled. Please check the README to set up Firestore.
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <FirebaseWarning />
            <div className="min-h-[100dvh] flex flex-col font-sans relative">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route element={<RoleRoute role="teacher" />}>
                    <Route element={<TeacherLayout />}>
                      <Route path="/teacher" element={<TeacherHome />} />
                      <Route path="/teacher/inventory" element={<QuestionBank />} />
                      <Route path="/teacher/create-exam" element={<CreateExam />} />
                      <Route path="/teacher/exams" element={<MyExams />} />
                      <Route path="/teacher/students" element={<StudentsList />} />
                      <Route path="/teacher/students/:id" element={<StudentDetail />} />
                    </Route>
                  </Route>
                  <Route element={<RoleRoute role="student" />}>
                    <Route element={<StudentLayout />}>
                      <Route path="/student" element={<StudentHome />} />
                      <Route path="/student/exams" element={<StudentExams />} />
                      <Route path="/student/progress" element={<StudentProgress />} />
                      <Route path="/student/leaderboard" element={<Leaderboard />} />
                      <Route path="/student/results/:id" element={<ResultDetail />} />
                    </Route>
                  </Route>

                  <Route path="/exam/:examId" element={<TakeExam />} />
                  <Route path="/student/exam/:examId" element={<TakeExam />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </div>
          </BrowserRouter>
          <Toaster theme="dark" />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

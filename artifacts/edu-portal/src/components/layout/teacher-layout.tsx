import { Link, Outlet, useLocation } from "react-router-dom";
import { BookOpen, Home, Library, FileText, Users, User, Bell, LogOut, Moon, Sun, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { subjectColor, cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Notification {
  id: string;
  teacherId: string;
  type: string;
  studentName: string;
  studentClass: number;
  examTitle: string;
  examId: string;
  score: number;
  total: number;
  percentage: number;
  exitViolation: boolean;
  violationType?: string;
  read: boolean;
  createdAt: any;
}

export default function TeacherLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  // Fetch real notifications from Firestore
  useEffect(() => {
    if (!user?.id) return;
    const q = query(
      collection(db, "notifications"),
      where("teacherId", "==", user.id)
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Notification[];
      // Sort: violations first, then newest
      docs.sort((a, b) => {
        if (a.exitViolation && !b.exitViolation) return -1;
        if (!a.exitViolation && b.exitViolation) return 1;
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      setNotifications(docs);
    });
    return () => unsub();
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) {
      try {
        await updateDoc(doc(db, "notifications", n.id), { read: true });
      } catch (err) {
        console.error(err);
      }
    }
  }

  function handleOpenNotifications() {
    setShowNotifications(true);
    markAllRead();
  }

  const navItems = [
    { name: "Home", path: "/teacher", icon: Home },
    { name: "Exams", path: "/teacher/exams", icon: FileText },
    { name: "Bank", path: "/teacher/inventory", icon: Library },
    { name: "Students", path: "/teacher/students", icon: Users },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground pb-16 md:pb-0">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg hidden md:inline-block">EDU PORTAL</span>
            <div className="hidden md:flex ml-6 gap-2">
              {user?.subjects?.map((sub) => {
                const color = subjectColor(sub);
                return (
                  <span
                    key={sub}
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ backgroundColor: color.bg, color: color.text }}
                  >
                    {sub}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Bell notification button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={handleOpenNotifications}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full border border-border"
                >
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.fullName}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      Teacher
                    </p>
                  </div>
                </div>
                <DropdownMenuItem onClick={toggleTheme}>
                  <Sun className="mr-2 h-4 w-4" />
                  Toggle Theme
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Desktop nav */}
      <div className="hidden md:block border-b border-border/40 bg-card/30">
        <div className="container mx-auto px-4 flex h-12 items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                location.pathname === item.path
                  ? "text-primary border-b-2 border-primary h-full"
                  : "text-muted-foreground",
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 w-full h-16 border-t border-border bg-background flex items-center justify-around z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full text-xs font-medium gap-1",
              location.pathname === item.path
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNotifications(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background border-l border-border flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="font-display font-bold text-lg">Notifications</h2>
                <p className="text-xs text-muted-foreground">
                  {notifications.length} total · {unreadCount} unread
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center">
                  <Bell className="w-10 h-10 mb-2 opacity-30" />
                  <p className="font-medium">No notifications yet</p>
                  <p className="text-xs mt-1">
                    Student submissions will appear here
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      n.exitViolation
                        ? "border-red-500/50 bg-red-500/10"
                        : n.read
                        ? "border-border bg-background/30"
                        : "border-primary/30 bg-primary/5"
                    }`}
                  >
                    {/* Violation badge */}
                    {n.exitViolation && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
                          ⚠️ Exam Exited — {n.violationType || "Violation"}
                        </span>
                      </div>
                    )}

                    {/* Student info */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">
                          {n.studentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Class {n.studentClass} · {n.examTitle}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                            n.percentage >= 50
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {n.percentage}%
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {n.score}/{n.total}
                        </p>
                      </div>
                    </div>

                    {/* Time */}
                    {n.createdAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(
                          n.createdAt.toMillis?.() || Date.now()
                        ).toLocaleString()}
                      </p>
                    )}

                    {/* Unread dot */}
                    {!n.read && !n.exitViolation && (
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle2 className="w-3 h-3 text-primary" />
                        <span className="text-xs text-primary">New</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

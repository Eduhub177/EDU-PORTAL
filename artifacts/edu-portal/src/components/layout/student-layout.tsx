import { Link, Outlet, useLocation } from "react-router-dom";
import { BookOpen, Home, Trophy, Activity, User, Bell, LogOut, Moon, Sun, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function StudentLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  const navItems = [
    { name: "Home", path: "/student", icon: Home },
    { name: "Exams", path: "/student/exams", icon: FileText },
    { name: "Progress", path: "/student/progress", icon: Activity },
    { name: "Leaderboard", path: "/student/leaderboard", icon: Trophy },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground pb-16 md:pb-0">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent" />
            <span className="font-display font-bold text-lg hidden md:inline-block">EDU PORTAL</span>
            
            <div className="hidden md:flex ml-6">
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-accent/20 text-accent">
                Class {user?.classLevel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.fullName}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">Student · Class {user?.classLevel}</p>
                  </div>
                </div>
                <DropdownMenuItem onClick={toggleTheme}>
                  <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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

      <div className="hidden md:block border-b border-border/40 bg-card/30">
        <div className="container mx-auto px-4 flex h-12 items-center gap-6">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className={cn(
              "text-sm font-medium transition-colors hover:text-accent flex items-center gap-2",
              location.pathname === item.path ? "text-accent border-b-2 border-accent h-full" : "text-muted-foreground"
            )}>
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 w-full h-16 border-t border-border bg-background flex items-center justify-around z-50">
        {navItems.map(item => (
          <Link key={item.path} to={item.path} className={cn(
            "flex flex-col items-center justify-center w-full h-full text-xs font-medium gap-1",
            location.pathname === item.path ? "text-accent" : "text-muted-foreground"
          )}>
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}

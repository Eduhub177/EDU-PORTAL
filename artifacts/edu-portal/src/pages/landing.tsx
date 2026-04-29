import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Activity } from "lucide-react";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-[100dvh] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
      
      <header className="container mx-auto px-4 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">EDU PORTAL</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild data-testid="link-login">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white" data-testid="link-signup">
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-display font-bold mb-6 max-w-4xl leading-tight"
        >
          The modern home for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">classroom assessments</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl"
        >
          Premium experience for teachers to create exams and students to compete. Real-time leaderboards, detailed analytics, and beautiful question interfaces.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-24"
        >
          <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90" asChild>
            <Link to="/signup">Get Started for Free</Link>
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">
          <FeatureCard 
            icon={<BookOpen className="w-6 h-6 text-primary" />}
            title="Teachers Create"
            desc="Build rich exams with images, custom timers, and reusable question banks."
            delay={0.3}
          />
          <FeatureCard 
            icon={<Trophy className="w-6 h-6 text-accent" />}
            title="Students Compete"
            desc="Take beautiful fullscreen exams and climb your class leaderboard."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Activity className="w-6 h-6 text-amber-500" />}
            title="Real-time Results"
            desc="Instant grading, automatic submission, and deep analytics on performance."
            delay={0.5}
          />
        </div>
      </main>

      <div className="w-full bg-card/30 border-y border-border/50 py-3 overflow-hidden relative z-10 flex">
        <div className="animate-marquee flex gap-8 whitespace-nowrap px-4">
           {/* Ticker placeholder since Firestore may be empty */}
           <TickerItem name="Alex J." score={98} subject="Physics" cls={10} />
           <TickerItem name="Maria S." score={95} subject="Mathematics" cls={12} />
           <TickerItem name="John D." score={92} subject="Computer Science" cls={11} />
           <TickerItem name="Sarah W." score={100} subject="Biology" cls={9} />
           <TickerItem name="Alex J." score={98} subject="Physics" cls={10} />
           <TickerItem name="Maria S." score={95} subject="Mathematics" cls={12} />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="glass p-8 rounded-2xl flex flex-col items-center text-center gap-4 hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-xl">{title}</h3>
      <p className="text-muted-foreground">{desc}</p>
    </motion.div>
  );
}

function TickerItem({ name, score, subject, cls }: { name: string, score: number, subject: string, cls: number }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <Trophy className="w-4 h-4 text-amber-500" />
      <span>{name} scored {score}% in {subject} · Class {cls}</span>
    </div>
  );
}

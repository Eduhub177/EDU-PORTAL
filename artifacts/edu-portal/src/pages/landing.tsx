import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Activity, ArrowRight, Sparkles } from "lucide-react";
import Particles from "@/components/particles";
import AnimatedBg from "@/components/animated-bg";
import PageTransition from "@/components/page-transition";

const heroWords = ["The", "modern", "home", "for"];
const accentWords = ["classroom", "assessments"];

const wordVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] as const } },
};

export default function Landing() {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-[100dvh] relative overflow-hidden">
        <AnimatedBg />
        <Particles count={36} />

        <header className="container mx-auto px-4 py-6 flex items-center justify-between relative z-10">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.55)] animate-glow-pulse">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">EDU PORTAL</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2 sm:gap-4"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="ghost" asChild data-testid="link-login">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-white transition-transform hover:scale-105" data-testid="link-signup">
              <Link to="/signup">Sign up</Link>
            </Button>
          </motion.div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-16 md:py-20 flex flex-col items-center justify-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-7 text-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Real-time exams · Live leaderboards</span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.08, delayChildren: 0.2 }}
            className="text-5xl md:text-7xl font-display font-bold mb-6 max-w-4xl leading-tight flex flex-wrap justify-center gap-x-4 gap-y-2"
          >
            {heroWords.map((w) => (
              <motion.span key={w} variants={wordVariants} className="inline-block">
                {w}
              </motion.span>
            ))}
            <span className="basis-full md:basis-auto" />
            {accentWords.map((w) => (
              <motion.span
                key={w}
                variants={wordVariants}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent animate-gradient-shift"
              >
                {w}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl"
          >
            Premium experience for teachers to create exams and students to compete. Real-time leaderboards, detailed analytics, and beautiful question interfaces.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-24"
          >
            <Button
              size="lg"
              className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 group animate-glow-pulse"
              asChild
              data-testid="button-get-started"
            >
              <Link to="/signup" className="inline-flex items-center gap-2">
                Get Started for Free
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg border-primary/40 hover:bg-primary/10 transition-transform hover:scale-105 active:scale-95"
              asChild
              data-testid="button-i-am-teacher"
            >
              <Link to="/login">I&apos;m a teacher</Link>
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">
            <FeatureCard
              icon={<BookOpen className="w-6 h-6 text-primary" />}
              title="Teachers Create"
              desc="Build rich exams with images, custom timers, and reusable question banks."
              delay={0.0}
              accent="from-primary/30 to-primary/0"
            />
            <FeatureCard
              icon={<Trophy className="w-6 h-6 text-accent" />}
              title="Students Compete"
              desc="Take beautiful fullscreen exams and climb your class leaderboard."
              delay={0.1}
              accent="from-accent/30 to-accent/0"
            />
            <FeatureCard
              icon={<Activity className="w-6 h-6 text-amber-500" />}
              title="Real-time Results"
              desc="Instant grading, automatic submission, and deep analytics on performance."
              delay={0.2}
              accent="from-amber-500/25 to-amber-500/0"
            />
          </div>
        </main>

        <div className="w-full bg-card/30 border-y border-border/50 py-3 overflow-hidden relative z-10 flex">
          <div className="animate-marquee flex gap-8 whitespace-nowrap px-4">
            <TickerItem name="Alex J." score={98} subject="Physics" cls={10} />
            <TickerItem name="Maria S." score={95} subject="Mathematics" cls={12} />
            <TickerItem name="John D." score={92} subject="Computer Science" cls={11} />
            <TickerItem name="Sarah W." score={100} subject="Biology" cls={9} />
            <TickerItem name="Alex J." score={98} subject="Physics" cls={10} />
            <TickerItem name="Maria S." score={95} subject="Mathematics" cls={12} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  delay,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -8 }}
      className="glass tilt-hover p-8 rounded-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden cursor-default"
    >
      <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${accent} pointer-events-none`} />
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center animate-float-y relative">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-xl relative">{title}</h3>
      <p className="text-muted-foreground relative">{desc}</p>
    </motion.div>
  );
}

function TickerItem({ name, score, subject, cls }: { name: string; score: number; subject: string; cls: number }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <Trophy className="w-4 h-4 text-amber-500" />
      <span>
        {name} scored {score}% in {subject} · Class {cls}
      </span>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Activity, GraduationCap, Users, Sparkles, Award } from "lucide-react";
import Particles from "@/components/particles";
import AnimatedBg from "@/components/animated-bg";
import WaterRipple from "@/components/water-ripple";
import PageTransition from "@/components/page-transition";

const heroWords = ["Classroom"];
const accentWords = ["Assessments"];

const wordVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] as const } },
};

const EDUCATORS = [
  {
    initials: "MKS",
    name: "Mrinal Kanti Shib",
    title: "Best Educator",
    years: "25+ Years",
    subjects: ["English", "Social Science"],
    quote: "Shaping minds, building futures.",
    glow: "from-primary/40 via-purple-500/30 to-accent/30",
    ring: "ring-primary/40",
  },
  {
    initials: "TKS",
    name: "Tarun Kanti Shib",
    title: "Best Educator",
    years: "15+ Years",
    subjects: ["Science", "Math"],
    quote: "Every student has the potential to excel.",
    glow: "from-cyan-500/40 via-accent/30 to-primary/30",
    ring: "ring-accent/40",
  },
];

export default function Landing() {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-[100dvh] relative overflow-hidden">
        <AnimatedBg />
        <Particles count={42} />

        <header className="container mx-auto px-4 py-6 flex items-center justify-between relative z-10">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.55)]">
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
            <Button variant="ghost" asChild data-testid="link-login-header">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-white transition-transform hover:scale-105" data-testid="link-signup-header">
              <Link to="/signup">Sign up</Link>
            </Button>
          </motion.div>
        </header>

        <main className="flex-1 container mx-auto px-4 pt-8 pb-16 flex flex-col items-center justify-center text-center relative z-10">
          {/* === HERO LOGO + RIPPLES === */}
          <div className="relative w-full flex items-center justify-center mb-2 h-44 sm:h-52">
            <WaterRipple size={420} rings={4} className="opacity-90" />
            <WaterRipple size={260} rings={3} className="opacity-70" />
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 }}
              className="relative z-10 flex flex-col items-center gap-3"
            >
              <div className="relative animate-logo-bob">
                <div className="absolute inset-0 rounded-3xl bg-primary blur-xl opacity-60" />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-primary via-purple-500 to-accent flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.6)] border border-white/10">
                  <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={2.2} />
                </div>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-[0.3em] bg-gradient-to-r from-primary via-purple-300 to-accent bg-clip-text text-transparent animate-gradient-shift">
                EDU&nbsp;PORTAL
              </h2>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-7 text-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Real-time exams · Live leaderboards</span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.1, delayChildren: 0.35 }}
            className="text-5xl md:text-7xl font-display font-bold mb-3 max-w-4xl leading-tight flex flex-wrap justify-center gap-x-4 gap-y-2"
          >
            {heroWords.map((w) => (
              <motion.span key={w} variants={wordVariants} className="inline-block">
                {w}
              </motion.span>
            ))}
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
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-base md:text-lg text-muted-foreground mb-10 max-w-2xl"
          >
            Premium experience for teachers to create exams and students to compete. Real-time leaderboards, detailed analytics, and beautiful question interfaces.
          </motion.p>

          {/* === NEW SIGN-UP CTAs === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-3 w-full max-w-2xl"
          >
            <Button
              size="lg"
              asChild
              className="flex-1 h-16 text-base bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white transition-all hover:scale-[1.03] active:scale-95 group shadow-[0_0_25px_rgba(124,58,237,0.4)]"
              data-testid="button-signup-teacher"
            >
              <Link to="/signup?role=teacher" className="inline-flex items-center justify-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center transition-transform group-hover:rotate-6">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-white/80 leading-tight">Sign up as a</p>
                  <p className="font-semibold leading-tight">Teacher</p>
                </div>
              </Link>
            </Button>

            <Button
              size="lg"
              asChild
              className="flex-1 h-16 text-base bg-gradient-to-r from-cyan-500 to-accent hover:from-cyan-500/90 hover:to-accent/90 text-white transition-all hover:scale-[1.03] active:scale-95 group shadow-[0_0_25px_rgba(6,182,212,0.4)]"
              data-testid="button-signup-student"
            >
              <Link to="/signup?role=student" className="inline-flex items-center justify-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center transition-transform group-hover:rotate-6">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-white/80 leading-tight">Sign up as a</p>
                  <p className="font-semibold leading-tight">Student</p>
                </div>
              </Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.5 }}
            className="text-sm text-muted-foreground mb-20"
          >
            If you already have an account,{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline underline-offset-4 hover:text-purple-300 transition-colors"
              data-testid="link-login-inline"
            >
              try log in
            </Link>
          </motion.p>

          {/* === MEET OUR EDUCATORS === */}
          <section className="w-full max-w-5xl mb-16 mt-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-primary via-purple-300 to-accent bg-clip-text text-transparent">
                Meet Our Educators
              </h2>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">
                Decades of teaching experience, distilled into one platform.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 relative">
              {/* Floating decorative orbs */}
              <div className="pointer-events-none absolute -top-8 left-8 w-40 h-40 rounded-full bg-primary/20 blur-3xl animate-float-y" />
              <div className="pointer-events-none absolute -bottom-8 right-8 w-44 h-44 rounded-full bg-accent/20 blur-3xl animate-float-y" style={{ animationDelay: "1.2s" }} />
              <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-purple-500/15 blur-2xl animate-float-y" style={{ animationDelay: "0.6s" }} />

              {EDUCATORS.map((ed, i) => (
                <motion.div
                  key={ed.initials}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.15, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                  whileHover={{ y: -6 }}
                  className="glass tilt-hover relative p-6 md:p-7 rounded-2xl text-left overflow-hidden"
                  data-testid={`card-educator-${ed.initials}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${ed.glow} opacity-30 pointer-events-none`} />
                  <div className="relative flex items-start gap-4">
                    <div className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-accent flex items-center justify-center font-display font-bold text-xl md:text-2xl text-white ring-2 ${ed.ring} shadow-[0_0_25px_rgba(124,58,237,0.4)]`}>
                      {ed.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-lg md:text-xl">{ed.name}</h3>
                      <p className="text-sm text-primary">{ed.title}</p>
                      <p className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Award className="w-3 h-3 text-amber-400" />
                        {ed.years}
                      </p>
                    </div>
                  </div>
                  <div className="relative mt-4 flex flex-wrap gap-2">
                    {ed.subjects.map((s) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="relative mt-4 italic text-sm md:text-base text-foreground/90 leading-relaxed">
                    “{ed.quote}”
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* === FEATURE CARDS === */}
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


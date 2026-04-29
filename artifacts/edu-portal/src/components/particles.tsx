import { useMemo } from "react";

interface ParticlesProps {
  count?: number;
  className?: string;
}

export default function Particles({ count = 30, className = "" }: ParticlesProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 4 + 2;
      const left = Math.random() * 100;
      const duration = Math.random() * 18 + 14;
      const delay = Math.random() * -duration;
      const hue = Math.random() > 0.5 ? "rgba(124,58,237,0.7)" : "rgba(6,182,212,0.6)";
      return { i, size, left, duration, delay, hue };
    });
  }, [count]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.i}
          className="absolute bottom-[-10vh] rounded-full animate-float-up"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.hue,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 3}px ${p.hue}`,
          }}
        />
      ))}
    </div>
  );
}

interface WaterRippleProps {
  size?: number;
  className?: string;
  rings?: number;
}

export default function WaterRipple({
  size = 360,
  className = "",
  rings = 4,
}: WaterRippleProps) {
  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-1/2 ${className}`}
      style={{ width: size, height: size, transform: "translate(-50%, -50%)" }}
      aria-hidden="true"
    >
      {Array.from({ length: rings }).map((_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full border border-primary/40 animate-ripple"
          style={{
            width: size,
            height: size,
            animationDelay: `${i * 1}s`,
            boxShadow:
              "0 0 30px rgba(124,58,237,0.3), inset 0 0 20px rgba(6,182,212,0.25)",
          }}
        />
      ))}
      {Array.from({ length: rings }).map((_, i) => (
        <span
          key={`c-${i}`}
          className="absolute left-1/2 top-1/2 rounded-full border border-accent/40 animate-ripple"
          style={{
            width: size * 0.7,
            height: size * 0.7,
            animationDelay: `${i * 1 + 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

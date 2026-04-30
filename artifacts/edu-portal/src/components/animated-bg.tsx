export default function AnimatedBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-primary/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob" />
      <div className="absolute -top-10 right-0 w-[26rem] h-[26rem] bg-accent/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-1/3 w-[30rem] h-[30rem] bg-purple-500/15 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-4000" />
    </div>
  );
}

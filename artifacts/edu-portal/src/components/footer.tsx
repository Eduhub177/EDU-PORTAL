export default function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-t-primary/20 bg-card/50 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-accent opacity-50"></div>
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center gap-3 text-center">
        <p className="font-display font-semibold text-lg md:text-xl bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
          ✦ This website belongs to Tarun Kanti Shib ✦
        </p>
        <p className="text-sm md:text-base text-muted-foreground animate-shimmer bg-[linear-gradient(110deg,#a1a1aa,45%,#fff,55%,#a1a1aa)] bg-[length:200%_100%] bg-clip-text text-transparent">
          &lt;/&gt; Developed with ❤ by Sreshtangshu Gope
        </p>
      </div>
    </footer>
  );
}

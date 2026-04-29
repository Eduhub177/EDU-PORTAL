export default function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-t-primary/20 bg-card/50 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-accent opacity-50"></div>
      <div className="container mx-auto px-4 py-8 flex items-center justify-center text-center">
        <p
          data-testid="text-footer-credit"
          className="font-display font-semibold text-lg md:text-xl bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent"
        >
          Developed by Sreshtangshu Gope
        </p>
      </div>
    </footer>
  );
}

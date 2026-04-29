import { motion } from "framer-motion";
import type { ReactNode } from "react";

const variants = {
  initial: { opacity: 0, y: 12 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] as const } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.25, ease: "easeOut" as const } },
};

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}

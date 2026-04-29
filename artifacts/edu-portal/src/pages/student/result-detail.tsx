import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ResultDetail() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/student"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <h1 className="text-2xl font-display font-bold">Physics Midterm Results</h1>
      </div>

      <div className="glass p-8 rounded-3xl text-center flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4"
        >
          <Award className="w-12 h-12" />
        </motion.div>
        <h2 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2">
          85%
        </h2>
        <p className="text-lg text-muted-foreground">You passed! Great job.</p>
        <div className="flex gap-6 mt-6 pt-6 border-t border-border/50 w-full justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Correct</p>
            <p className="text-2xl font-semibold text-green-500">17</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Wrong</p>
            <p className="text-2xl font-semibold text-red-500">3</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Time Taken</p>
            <p className="text-2xl font-semibold">24m</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 mt-8">
        <h3 className="text-xl font-display font-semibold px-2">Review Answers</h3>
        
        {/* Dummy review question */}
        <div className="glass p-6 rounded-2xl border-l-4 border-l-green-500">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-muted-foreground">Question 1</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <h4 className="text-lg font-medium mb-4">What is the speed of light?</h4>
          <div className="p-3 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 font-medium">
            Your Answer: 3x10^8 m/s (Correct)
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border-l-4 border-l-red-500">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-muted-foreground">Question 2</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <h4 className="text-lg font-medium mb-4">Force equals mass times...</h4>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 font-medium line-through">
              Your Answer: Velocity
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 font-medium">
              Correct Answer: Acceleration
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

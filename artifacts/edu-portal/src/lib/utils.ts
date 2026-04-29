import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function subjectColor(subject: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    "English": { bg: "hsl(210 100% 90%)", text: "hsl(210 100% 30%)" },
    "Mathematics": { bg: "hsl(0 100% 90%)", text: "hsl(0 100% 30%)" },
    "Science": { bg: "hsl(120 100% 90%)", text: "hsl(120 100% 30%)" },
    "Social Science": { bg: "hsl(30 100% 90%)", text: "hsl(30 100% 30%)" },
    "Hindi": { bg: "hsl(280 100% 90%)", text: "hsl(280 100% 30%)" },
    "Physics": { bg: "hsl(250 100% 90%)", text: "hsl(250 100% 30%)" },
    "Chemistry": { bg: "hsl(320 100% 90%)", text: "hsl(320 100% 30%)" },
    "Biology": { bg: "hsl(150 100% 90%)", text: "hsl(150 100% 30%)" },
    "History": { bg: "hsl(45 100% 90%)", text: "hsl(45 100% 30%)" },
    "Geography": { bg: "hsl(200 100% 90%)", text: "hsl(200 100% 30%)" },
    "Computer Science": { bg: "hsl(180 100% 90%)", text: "hsl(180 100% 30%)" },
    "Economics": { bg: "hsl(60 100% 90%)", text: "hsl(60 100% 30%)" },
  };
  return colors[subject] || { bg: "hsl(240 100% 90%)", text: "hsl(240 100% 30%)" };
}

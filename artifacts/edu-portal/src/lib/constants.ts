export const SUBJECTS = [
  "English",
  "Mathematics",
  "Science",
  "Social Science",
  "Hindi",
  "Bengali",
  "Sanskrit",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Civics",
  "Economics",
  "Computer Science",
  "Physical Education",
  "Art",
  "Music",
  "Environmental Science",
  "Moral Science",
] as const;

export type Subject = typeof SUBJECTS[number];

export const CLASS_LEVELS = [6, 7, 8, 9, 10, 11, 12] as const;

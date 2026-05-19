import type { LearningUnit } from "@/types/learning";

export const units = [
  {
    id: "spanish-basics-1",
    languageId: "es",
    title: "Spanish Basics 1",
    description: "Say hello, introduce yourself, and order something simple.",
    level: "beginner",
    order: 1,
    lessonIds: ["spanish-greetings", "spanish-cafe", "spanish-lesson-3", "spanish-lesson-4", "spanish-lesson-5", "spanish-lesson-6", "spanish-lesson-7"],
  },
  {
    id: "french-basics-1",
    languageId: "fr",
    title: "French Basics 1",
    description: "Practice polite greetings and easy cafe phrases.",
    level: "beginner",
    order: 1,
    lessonIds: ["french-greetings", "french-cafe", "french-lesson-3", "french-lesson-4", "french-lesson-5", "french-lesson-6", "french-lesson-7"],
  },
  {
    id: "japanese-basics-1",
    languageId: "ja",
    title: "Japanese Basics 1",
    description: "Build confidence with greetings and simple travel phrases.",
    level: "beginner",
    order: 1,
    lessonIds: ["japanese-greetings", "japanese-travel", "japanese-lesson-3", "japanese-lesson-4", "japanese-lesson-5", "japanese-lesson-6", "japanese-lesson-7"],
  },
] satisfies LearningUnit[];

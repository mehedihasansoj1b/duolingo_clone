import type { LearningUnit } from "@/types/learning";

export const units = [
  {
    id: "spanish-basics-1",
    languageId: "es",
    title: "Spanish Basics 1",
    description: "Say hello, introduce yourself, and order something simple.",
    level: "beginner",
    order: 1,
    lessonIds: ["spanish-greetings", "spanish-cafe"],
  },
  {
    id: "french-basics-1",
    languageId: "fr",
    title: "French Basics 1",
    description: "Practice polite greetings and easy cafe phrases.",
    level: "beginner",
    order: 1,
    lessonIds: ["french-greetings", "french-cafe"],
  },
  {
    id: "japanese-basics-1",
    languageId: "ja",
    title: "Japanese Basics 1",
    description: "Build confidence with greetings and simple travel phrases.",
    level: "beginner",
    order: 1,
    lessonIds: ["japanese-greetings", "japanese-travel"],
  },
] satisfies LearningUnit[];

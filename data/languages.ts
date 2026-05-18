import type { LearningLanguage } from "@/types/learning";

export const languages = [
  {
    id: "es",
    name: "Spanish",
    nativeName: "Español",
    flagEmoji: "🇪🇸",
    accentColor: "#FF6B35",
    description: "A friendly first path for greetings, food, and daily chats.",
  },
  {
    id: "fr",
    name: "French",
    nativeName: "Français",
    flagEmoji: "🇫🇷",
    accentColor: "#3B82F6",
    description: "Start with polite phrases and simple cafe conversations.",
  },
  {
    id: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flagEmoji: "🇯🇵",
    accentColor: "#EF4444",
    description: "Learn warm greetings and beginner travel phrases.",
  },
] satisfies LearningLanguage[];

export const supportedLanguageIds = languages.map((language) => language.id);

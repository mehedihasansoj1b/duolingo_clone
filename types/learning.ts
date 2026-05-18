export type LanguageCode = "es" | "fr" | "ja";

export type ProficiencyLevel = "beginner" | "early-intermediate";

export type LessonMode = "practice" | "audio-vision-agent";

export type ActivityKind =
  | "listen-and-repeat"
  | "multiple-choice"
  | "speaking-prompt"
  | "translation";

export type LearningLanguage = {
  id: LanguageCode;
  name: string;
  nativeName: string;
  flagEmoji: string;
  accentColor: string;
  description: string;
};

export type LearningUnit = {
  id: string;
  languageId: LanguageCode;
  title: string;
  description: string;
  level: ProficiencyLevel;
  order: number;
  lessonIds: string[];
};

export type LessonGoal = {
  id: string;
  text: string;
};

export type VocabularyEntry = {
  id: string;
  term: string;
  translation: string;
  transliteration?: string;
  pronunciationHint?: string;
  partOfSpeech?: "noun" | "verb" | "adjective" | "phrase" | "interjection";
};

export type PhraseEntry = {
  id: string;
  text: string;
  translation: string;
  transliteration?: string;
  pronunciationHint?: string;
};

type BaseLessonActivity = {
  id: string;
  kind: ActivityKind;
  prompt: string;
};

export type ListenAndRepeatActivity = BaseLessonActivity & {
  kind: "listen-and-repeat";
  contentId: string;
};

export type MultipleChoiceActivity = BaseLessonActivity & {
  kind: "multiple-choice";
  correctAnswer: string;
  choices: string[];
};

export type SpeakingPromptActivity = BaseLessonActivity & {
  kind: "speaking-prompt";
  expectedPhrases: string[];
};

export type TranslationActivity = BaseLessonActivity & {
  kind: "translation";
  sourceText: string;
  targetTranslation: string;
};

export type LessonActivity =
  | ListenAndRepeatActivity
  | MultipleChoiceActivity
  | SpeakingPromptActivity
  | TranslationActivity;

export type AiTeacherPrompt = {
  persona: string;
  lessonBrief: string;
  audioInstructions: string;
  correctionStyle: string;
  wrapUpPrompt: string;
};

export type LearningLesson = {
  id: string;
  unitId: string;
  languageId: LanguageCode;
  title: string;
  description: string;
  level: ProficiencyLevel;
  mode: LessonMode;
  xpReward: number;
  estimatedMinutes: number;
  goals: LessonGoal[];
  vocabulary: VocabularyEntry[];
  phrases: PhraseEntry[];
  activities: LessonActivity[];
  aiTeacherPrompt: AiTeacherPrompt;
};

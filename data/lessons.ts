import type { LearningLesson } from "@/types/learning";

export const lessons = [
  {
    id: "spanish-greetings",
    unitId: "spanish-basics-1",
    languageId: "es",
    title: "First Greetings",
    description: "Meet someone and ask how they are.",
    level: "beginner",
    mode: "audio-vision-agent",
    xpReward: 10,
    estimatedMinutes: 4,
    goals: [
      { id: "es-greetings-goal-1", text: "Say hello and goodbye in Spanish." },
      { id: "es-greetings-goal-2", text: "Ask someone how they are feeling." },
    ],
    vocabulary: [
      {
        id: "es-vocab-hola",
        term: "hola",
        translation: "hello",
        pronunciationHint: "OH-lah",
        partOfSpeech: "interjection",
      },
      {
        id: "es-vocab-gracias",
        term: "gracias",
        translation: "thank you",
        pronunciationHint: "GRAH-see-ahs",
        partOfSpeech: "phrase",
      },
      {
        id: "es-vocab-adios",
        term: "adiós",
        translation: "goodbye",
        pronunciationHint: "ah-DYOS",
        partOfSpeech: "interjection",
      },
    ],
    phrases: [
      {
        id: "es-phrase-como-estas",
        text: "¿Cómo estás?",
        translation: "How are you?",
        pronunciationHint: "KOH-moh ehs-TAHS",
      },
      {
        id: "es-phrase-estoy-bien",
        text: "Estoy bien.",
        translation: "I am well.",
        pronunciationHint: "ehs-TOY byen",
      },
    ],
    activities: [
      {
        id: "es-greetings-activity-1",
        kind: "listen-and-repeat",
        prompt: "Listen to the teacher say hello, then repeat it.",
        contentId: "es-vocab-hola",
      },
      {
        id: "es-greetings-activity-2",
        kind: "multiple-choice",
        prompt: "What does gracias mean?",
        correctAnswer: "thank you",
        choices: ["thank you", "good morning", "see you soon"],
      },
      {
        id: "es-greetings-activity-3",
        kind: "speaking-prompt",
        prompt: "Greet your teacher and ask how they are.",
        expectedPhrases: ["Hola", "¿Cómo estás?"],
      },
    ],
    aiTeacherPrompt: {
      persona: "You are a cheerful Spanish teacher for absolute beginners.",
      lessonBrief:
        "Teach warm greetings slowly. Keep the learner speaking after every example.",
      audioInstructions:
        "Speak clearly, leave pauses for repetition, and listen for hola, gracias, adiós, and ¿Cómo estás?",
      correctionStyle:
        "Correct only one pronunciation issue at a time and model the phrase again.",
      wrapUpPrompt:
        "End by asking the learner to say hello, ask how you are, and say goodbye.",
    },
  },
  {
    id: "spanish-cafe",
    unitId: "spanish-basics-1",
    languageId: "es",
    title: "At the Cafe",
    description: "Order water or coffee with a polite phrase.",
    level: "beginner",
    mode: "practice",
    xpReward: 10,
    estimatedMinutes: 5,
    goals: [
      { id: "es-cafe-goal-1", text: "Order a drink politely." },
      { id: "es-cafe-goal-2", text: "Recognize water and coffee." },
    ],
    vocabulary: [
      {
        id: "es-vocab-agua",
        term: "agua",
        translation: "water",
        pronunciationHint: "AH-gwah",
        partOfSpeech: "noun",
      },
      {
        id: "es-vocab-cafe",
        term: "café",
        translation: "coffee",
        pronunciationHint: "kah-FEH",
        partOfSpeech: "noun",
      },
      {
        id: "es-vocab-por-favor",
        term: "por favor",
        translation: "please",
        pronunciationHint: "por fah-VOR",
        partOfSpeech: "phrase",
      },
    ],
    phrases: [
      {
        id: "es-phrase-quiero-agua",
        text: "Quiero agua, por favor.",
        translation: "I want water, please.",
        pronunciationHint: "KYEH-roh AH-gwah por fah-VOR",
      },
    ],
    activities: [
      {
        id: "es-cafe-activity-1",
        kind: "translation",
        prompt: "Translate this order.",
        sourceText: "Quiero agua, por favor.",
        targetTranslation: "I want water, please.",
      },
      {
        id: "es-cafe-activity-2",
        kind: "multiple-choice",
        prompt: "Which word means coffee?",
        correctAnswer: "café",
        choices: ["agua", "café", "hola"],
      },
    ],
    aiTeacherPrompt: {
      persona: "You are a patient Spanish cafe role-play partner.",
      lessonBrief:
        "Help the learner order one drink using quiero, agua, café, and por favor.",
      audioInstructions:
        "Role-play as the cafe worker and prompt the learner to place an order out loud.",
      correctionStyle:
        "Praise the full sentence first, then gently fix word order or pronunciation.",
      wrapUpPrompt:
        "Ask the learner to order water once and coffee once before finishing.",
    },
  },
  {
    id: "french-greetings",
    unitId: "french-basics-1",
    languageId: "fr",
    title: "Bonjour",
    description: "Use polite greetings for a first conversation.",
    level: "beginner",
    mode: "audio-vision-agent",
    xpReward: 10,
    estimatedMinutes: 4,
    goals: [
      { id: "fr-greetings-goal-1", text: "Say hello and thank you in French." },
      { id: "fr-greetings-goal-2", text: "Ask how someone is doing." },
    ],
    vocabulary: [
      {
        id: "fr-vocab-bonjour",
        term: "bonjour",
        translation: "hello",
        pronunciationHint: "bohn-ZHOOR",
        partOfSpeech: "interjection",
      },
      {
        id: "fr-vocab-merci",
        term: "merci",
        translation: "thank you",
        pronunciationHint: "mehr-SEE",
        partOfSpeech: "phrase",
      },
      {
        id: "fr-vocab-au-revoir",
        term: "au revoir",
        translation: "goodbye",
        pronunciationHint: "oh ruh-VWAHR",
        partOfSpeech: "phrase",
      },
    ],
    phrases: [
      {
        id: "fr-phrase-comment-ca-va",
        text: "Comment ça va ?",
        translation: "How is it going?",
        pronunciationHint: "koh-MAHN sah vah",
      },
      {
        id: "fr-phrase-ca-va-bien",
        text: "Ça va bien.",
        translation: "It is going well.",
        pronunciationHint: "sah vah BYAN",
      },
    ],
    activities: [
      {
        id: "fr-greetings-activity-1",
        kind: "listen-and-repeat",
        prompt: "Listen to bonjour and repeat it clearly.",
        contentId: "fr-vocab-bonjour",
      },
      {
        id: "fr-greetings-activity-2",
        kind: "multiple-choice",
        prompt: "What does merci mean?",
        correctAnswer: "thank you",
        choices: ["thank you", "goodbye", "coffee"],
      },
      {
        id: "fr-greetings-activity-3",
        kind: "speaking-prompt",
        prompt: "Say hello and ask how it is going.",
        expectedPhrases: ["Bonjour", "Comment ça va ?"],
      },
    ],
    aiTeacherPrompt: {
      persona: "You are a kind French teacher who speaks slowly and warmly.",
      lessonBrief:
        "Teach bonjour, merci, au revoir, and Comment ça va ? with short call-and-response practice.",
      audioInstructions:
        "Use clear audio pacing and invite the learner to repeat each phrase twice.",
      correctionStyle:
        "Focus on confidence first, then guide the learner toward softer French sounds.",
      wrapUpPrompt:
        "Finish with a tiny conversation using bonjour, Comment ça va ?, merci, and au revoir.",
    },
  },
  {
    id: "french-cafe",
    unitId: "french-basics-1",
    languageId: "fr",
    title: "Cafe Order",
    description: "Ask for a coffee or water politely.",
    level: "beginner",
    mode: "practice",
    xpReward: 10,
    estimatedMinutes: 5,
    goals: [
      { id: "fr-cafe-goal-1", text: "Ask for a drink using je voudrais." },
      { id: "fr-cafe-goal-2", text: "Use s'il vous plaît politely." },
    ],
    vocabulary: [
      {
        id: "fr-vocab-eau",
        term: "eau",
        translation: "water",
        pronunciationHint: "oh",
        partOfSpeech: "noun",
      },
      {
        id: "fr-vocab-cafe",
        term: "café",
        translation: "coffee",
        pronunciationHint: "kah-FEH",
        partOfSpeech: "noun",
      },
      {
        id: "fr-vocab-svp",
        term: "s'il vous plaît",
        translation: "please",
        pronunciationHint: "seel voo PLEH",
        partOfSpeech: "phrase",
      },
    ],
    phrases: [
      {
        id: "fr-phrase-voudrais-cafe",
        text: "Je voudrais un café, s'il vous plaît.",
        translation: "I would like a coffee, please.",
        pronunciationHint: "zhuh voo-DREH uhn kah-FEH seel voo PLEH",
      },
    ],
    activities: [
      {
        id: "fr-cafe-activity-1",
        kind: "translation",
        prompt: "Translate this cafe order.",
        sourceText: "Je voudrais un café, s'il vous plaît.",
        targetTranslation: "I would like a coffee, please.",
      },
      {
        id: "fr-cafe-activity-2",
        kind: "multiple-choice",
        prompt: "Which phrase means please?",
        correctAnswer: "s'il vous plaît",
        choices: ["bonjour", "s'il vous plaît", "merci"],
      },
    ],
    aiTeacherPrompt: {
      persona: "You are a friendly French cafe tutor.",
      lessonBrief:
        "Practice ordering coffee and water with je voudrais and s'il vous plaît.",
      audioInstructions:
        "Use a simple cafe role-play and wait for the learner to answer out loud.",
      correctionStyle:
        "Keep corrections brief and repeat the full phrase after each attempt.",
      wrapUpPrompt:
        "Ask for one final polite order, then celebrate the learner's progress.",
    },
  },
  {
    id: "japanese-greetings",
    unitId: "japanese-basics-1",
    languageId: "ja",
    title: "Friendly Greetings",
    description: "Say hello, thank you, and goodbye.",
    level: "beginner",
    mode: "audio-vision-agent",
    xpReward: 10,
    estimatedMinutes: 4,
    goals: [
      { id: "ja-greetings-goal-1", text: "Recognize basic Japanese greetings." },
      { id: "ja-greetings-goal-2", text: "Repeat phrases with simple rhythm." },
    ],
    vocabulary: [
      {
        id: "ja-vocab-konnichiwa",
        term: "こんにちは",
        translation: "hello",
        transliteration: "konnichiwa",
        pronunciationHint: "koh-nee-chee-wah",
        partOfSpeech: "interjection",
      },
      {
        id: "ja-vocab-arigato",
        term: "ありがとう",
        translation: "thank you",
        transliteration: "arigatou",
        pronunciationHint: "ah-ree-gah-toh",
        partOfSpeech: "phrase",
      },
      {
        id: "ja-vocab-sayonara",
        term: "さようなら",
        translation: "goodbye",
        transliteration: "sayounara",
        pronunciationHint: "sah-yoh-nah-rah",
        partOfSpeech: "interjection",
      },
    ],
    phrases: [
      {
        id: "ja-phrase-genki",
        text: "元気ですか。",
        translation: "How are you?",
        transliteration: "Genki desu ka.",
        pronunciationHint: "gen-kee dess kah",
      },
      {
        id: "ja-phrase-genki-desu",
        text: "元気です。",
        translation: "I am well.",
        transliteration: "Genki desu.",
        pronunciationHint: "gen-kee dess",
      },
    ],
    activities: [
      {
        id: "ja-greetings-activity-1",
        kind: "listen-and-repeat",
        prompt: "Listen to こんにちは and repeat it.",
        contentId: "ja-vocab-konnichiwa",
      },
      {
        id: "ja-greetings-activity-2",
        kind: "multiple-choice",
        prompt: "What does ありがとう mean?",
        correctAnswer: "thank you",
        choices: ["thank you", "hello", "water"],
      },
      {
        id: "ja-greetings-activity-3",
        kind: "speaking-prompt",
        prompt: "Say hello and ask how your teacher is.",
        expectedPhrases: ["こんにちは", "元気ですか。"],
      },
    ],
    aiTeacherPrompt: {
      persona: "You are a gentle Japanese teacher for complete beginners.",
      lessonBrief:
        "Introduce greetings with Japanese text, romanization, and slow repetition.",
      audioInstructions:
        "Say each phrase slowly, then naturally. Leave enough silence for the learner to repeat.",
      correctionStyle:
        "Encourage rhythm and vowel clarity without overwhelming the learner.",
      wrapUpPrompt:
        "Close with a short greeting exchange using こんにちは, 元気ですか, ありがとう, and さようなら.",
    },
  },
  {
    id: "japanese-travel",
    unitId: "japanese-basics-1",
    languageId: "ja",
    title: "Travel Basics",
    description: "Use a few helpful phrases for getting around.",
    level: "beginner",
    mode: "practice",
    xpReward: 10,
    estimatedMinutes: 5,
    goals: [
      { id: "ja-travel-goal-1", text: "Say excuse me and please." },
      { id: "ja-travel-goal-2", text: "Ask for water politely." },
    ],
    vocabulary: [
      {
        id: "ja-vocab-sumimasen",
        term: "すみません",
        translation: "excuse me",
        transliteration: "sumimasen",
        pronunciationHint: "soo-mee-mah-sen",
        partOfSpeech: "phrase",
      },
      {
        id: "ja-vocab-mizu",
        term: "水",
        translation: "water",
        transliteration: "mizu",
        pronunciationHint: "mee-zoo",
        partOfSpeech: "noun",
      },
      {
        id: "ja-vocab-kudasai",
        term: "ください",
        translation: "please give me",
        transliteration: "kudasai",
        pronunciationHint: "koo-dah-sai",
        partOfSpeech: "phrase",
      },
    ],
    phrases: [
      {
        id: "ja-phrase-mizu-kudasai",
        text: "水をください。",
        translation: "Water, please.",
        transliteration: "Mizu o kudasai.",
        pronunciationHint: "mee-zoo oh koo-dah-sai",
      },
    ],
    activities: [
      {
        id: "ja-travel-activity-1",
        kind: "translation",
        prompt: "Translate this request.",
        sourceText: "水をください。",
        targetTranslation: "Water, please.",
      },
      {
        id: "ja-travel-activity-2",
        kind: "multiple-choice",
        prompt: "Which phrase means excuse me?",
        correctAnswer: "すみません",
        choices: ["水", "すみません", "ありがとう"],
      },
    ],
    aiTeacherPrompt: {
      persona: "You are a calm Japanese travel phrase coach.",
      lessonBrief:
        "Practice useful travel phrases with short, polite requests.",
      audioInstructions:
        "Run a simple travel role-play where the learner asks for water after saying excuse me.",
      correctionStyle:
        "Repeat the learner's sentence correctly and invite one more relaxed attempt.",
      wrapUpPrompt:
        "End after the learner says すみません and 水をください in one exchange.",
    },
  },
] satisfies LearningLesson[];

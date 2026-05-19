import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  ImageBackground,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";

import { lessons } from "@/data/lessons";
import { languages } from "@/data/languages";
import { images } from "@/constants/images";
import type { LearningLesson } from "@/types/learning";

interface SpeechStep {
  teacherText: string;
  teacherTranslation: string;
  prompt: string;
  expectedUserSpeech: string;
  speakingScore: "Excellent" | "Great" | "Good" | "Muted" | "Pending";
  pronunciationScore: "Excellent" | "Great" | "Good" | "Muted" | "Pending";
  grammarScore: "Excellent" | "Great" | "Good" | "Muted" | "Pending";
}

export default function AudioLessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Find selected lesson
  const lesson = lessons.find((l) => l.id === id) as LearningLesson | undefined;
  
  // Find language
  const language = languages.find((lang) => lang.id === lesson?.languageId);

  // Screen States
  const [status, setStatus] = useState<"connecting" | "connected" | "ended">("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);
  const [userSpokenText, setUserSpokenText] = useState("");

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0.2)).current;
  const waveAnim2 = useRef(new Animated.Value(0.4)).current;
  const waveAnim3 = useRef(new Animated.Value(0.3)).current;

  // Compile lesson conversational steps based on target language
  const steps: SpeechStep[] = React.useMemo(() => {
    if (!lesson) return [];

    const compiledSteps: SpeechStep[] = [];
    const langCode = lesson.languageId;
    const langName = language?.name || "this language";

    if (langCode === "es") {
      // Step 0: Greeting
      compiledSteps.push({
        teacherText: `¡Hola! Soy tu profesor de IA. Practiquemos "${lesson.title}" en español. ¿Estás listo?`,
        teacherTranslation: `Hello! I am your AI teacher. Let's practice "${lesson.title}" in Spanish. Are you ready?`,
        prompt: `Tap the mic and say "Sí" to start!`,
        expectedUserSpeech: "Sí",
        speakingScore: "Pending",
        pronunciationScore: "Pending",
        grammarScore: "Pending",
      });

      // Vocabulary Repeat Steps
      if (lesson.vocabulary && lesson.vocabulary.length > 0) {
        lesson.vocabulary.forEach((vocab, index) => {
          compiledSteps.push({
            teacherText: `Primero, practiquemos la palabra: "${vocab.term}". Significa "${vocab.translation}". Escucha y repite: "${vocab.term}".`,
            teacherTranslation: `First, let's practice the word: "${vocab.term}". It means "${vocab.translation}". Listen and repeat: "${vocab.term}".`,
            prompt: `Tap mic and repeat: "${vocab.term}"`,
            expectedUserSpeech: vocab.term,
            speakingScore: "Excellent",
            pronunciationScore: index % 2 === 0 ? "Great" : "Excellent",
            grammarScore: "Excellent",
          });
        });
      }

      // Phrase Repeat Steps
      if (lesson.phrases && lesson.phrases.length > 0) {
        lesson.phrases.forEach((phrase, index) => {
          compiledSteps.push({
            teacherText: `Ahora, intenta esta frase: "${phrase.text}". En inglés es: "${phrase.translation}". Repite: "${phrase.text}".`,
            teacherTranslation: `Now, try this phrase: "${phrase.text}". In English it is: "${phrase.translation}". Repeat: "${phrase.text}".`,
            prompt: `Tap mic and repeat: "${phrase.text}"`,
            expectedUserSpeech: phrase.text,
            speakingScore: index % 2 === 0 ? "Excellent" : "Great",
            pronunciationScore: "Great",
            grammarScore: index % 2 === 0 ? "Good" : "Excellent",
          });
        });
      }

      // Wrap Up Step
      compiledSteps.push({
        teacherText: lesson.aiTeacherPrompt.wrapUpPrompt || "¡Excelente trabajo! Has terminado con éxito la lección de audio de hoy.",
        teacherTranslation: "Excellent job! You've successfully finished today's audio lesson.",
        prompt: "Lesson complete! Tap End Call to finish.",
        expectedUserSpeech: "",
        speakingScore: "Excellent",
        pronunciationScore: "Excellent",
        grammarScore: "Excellent",
      });
    } else if (langCode === "fr") {
      // Step 0: Greeting
      compiledSteps.push({
        teacherText: `Bonjour ! Je suis ton professeur d'IA. Pratiquons "${lesson.title}" en français. Es-tu prêt ?`,
        teacherTranslation: `Hello! I am your AI teacher. Let's practice "${lesson.title}" in French. Are you ready?`,
        prompt: `Tap the mic and say "Oui" to start!`,
        expectedUserSpeech: "Oui",
        speakingScore: "Pending",
        pronunciationScore: "Pending",
        grammarScore: "Pending",
      });

      // Vocabulary Repeat Steps
      if (lesson.vocabulary && lesson.vocabulary.length > 0) {
        lesson.vocabulary.forEach((vocab, index) => {
          compiledSteps.push({
            teacherText: `D'abord, pratiquons le mot : "${vocab.term}". Cela signifie "${vocab.translation}". Écoute et répète : "${vocab.term}".`,
            teacherTranslation: `First, let's practice the word: "${vocab.term}". It means "${vocab.translation}". Listen and repeat: "${vocab.term}".`,
            prompt: `Tap mic and repeat: "${vocab.term}"`,
            expectedUserSpeech: vocab.term,
            speakingScore: "Excellent",
            pronunciationScore: index % 2 === 0 ? "Great" : "Excellent",
            grammarScore: "Excellent",
          });
        });
      }

      // Phrase Repeat Steps
      if (lesson.phrases && lesson.phrases.length > 0) {
        lesson.phrases.forEach((phrase, index) => {
          compiledSteps.push({
            teacherText: `Maintenant, essaie cette phrase : "${phrase.text}". En anglais : "${phrase.translation}". Répète : "${phrase.text}".`,
            teacherTranslation: `Now, try this phrase: "${phrase.text}". In English: "${phrase.translation}". Repeat: "${phrase.text}".`,
            prompt: `Tap mic and repeat: "${phrase.text}"`,
            expectedUserSpeech: phrase.text,
            speakingScore: index % 2 === 0 ? "Excellent" : "Great",
            pronunciationScore: "Great",
            grammarScore: index % 2 === 0 ? "Good" : "Excellent",
          });
        });
      }

      // Wrap Up Step
      compiledSteps.push({
        teacherText: lesson.aiTeacherPrompt.wrapUpPrompt || "Excellent travail ! Tu as terminé avec succès la leçon de français.",
        teacherTranslation: "Excellent job! You have successfully finished today's audio lesson.",
        prompt: "Lesson complete! Tap End Call to finish.",
        expectedUserSpeech: "",
        speakingScore: "Excellent",
        pronunciationScore: "Excellent",
        grammarScore: "Excellent",
      });
    } else if (langCode === "ja") {
      // Step 0: Greeting
      compiledSteps.push({
        teacherText: `こんにちは！私はあなたのAI先生です。「${lesson.title}」を練習しましょう。準備はいいですか？`,
        teacherTranslation: `Hello! I am your AI teacher. Let's practice "${lesson.title}" in Japanese. Are you ready?`,
        prompt: `Tap the mic and say "はい" to start!`,
        expectedUserSpeech: "はい",
        speakingScore: "Pending",
        pronunciationScore: "Pending",
        grammarScore: "Pending",
      });

      // Vocabulary Repeat Steps
      if (lesson.vocabulary && lesson.vocabulary.length > 0) {
        lesson.vocabulary.forEach((vocab, index) => {
          compiledSteps.push({
            teacherText: `最初に、次の単語を練習しましょう：「${vocab.term}」。意味は「${vocab.translation}」です。繰り返してください：「${vocab.term}」。`,
            teacherTranslation: `First, let's practice the word: "${vocab.term}". It means "${vocab.translation}". Listen and repeat: "${vocab.term}".`,
            prompt: `Tap mic and repeat: "${vocab.term}"`,
            expectedUserSpeech: vocab.term,
            speakingScore: "Excellent",
            pronunciationScore: index % 2 === 0 ? "Great" : "Excellent",
            grammarScore: "Excellent",
          });
        });
      }

      // Phrase Repeat Steps
      if (lesson.phrases && lesson.phrases.length > 0) {
        lesson.phrases.forEach((phrase, index) => {
          compiledSteps.push({
            teacherText: `次は、このフレーズです：「${phrase.text}」。意味は「${phrase.translation}」です。繰り返してください：「${phrase.text}」。`,
            teacherTranslation: `Now, try this phrase: "${phrase.text}". It means "${phrase.translation}". Repeat: "${phrase.text}".`,
            prompt: `Tap mic and repeat: "${phrase.text}"`,
            expectedUserSpeech: phrase.text,
            speakingScore: index % 2 === 0 ? "Excellent" : "Great",
            pronunciationScore: "Great",
            grammarScore: index % 2 === 0 ? "Good" : "Excellent",
          });
        });
      }

      // Wrap Up Step
      compiledSteps.push({
        teacherText: lesson.aiTeacherPrompt.wrapUpPrompt || "素晴らしい出来です！今日の日本語レッスンはこれで終了です。",
        teacherTranslation: "Wonderful job! Today's Japanese lesson is complete. Thank you!",
        prompt: "Lesson complete! Tap End Call to finish.",
        expectedUserSpeech: "",
        speakingScore: "Excellent",
        pronunciationScore: "Excellent",
        grammarScore: "Excellent",
      });
    } else {
      // Default / Fallback
      compiledSteps.push({
        teacherText: `Hello! I am your AI teacher. Let's practice "${lesson.title}" in ${langName}. Ready?`,
        teacherTranslation: `Welcome to your audio lesson. Let's begin.`,
        prompt: `Tap the mic and say "Yes" to start!`,
        expectedUserSpeech: "Yes",
        speakingScore: "Pending",
        pronunciationScore: "Pending",
        grammarScore: "Pending",
      });

      // Vocabulary Repeat Steps
      if (lesson.vocabulary && lesson.vocabulary.length > 0) {
        lesson.vocabulary.forEach((vocab, index) => {
          compiledSteps.push({
            teacherText: `Let's practice the word: "${vocab.term}". It means "${vocab.translation}". Repeat: "${vocab.term}".`,
            teacherTranslation: `Vocabulary practice: "${vocab.term}"`,
            prompt: `Tap mic and repeat: "${vocab.term}"`,
            expectedUserSpeech: vocab.term,
            speakingScore: "Excellent",
            pronunciationScore: index % 2 === 0 ? "Great" : "Excellent",
            grammarScore: "Excellent",
          });
        });
      }

      // Phrase Repeat Steps
      if (lesson.phrases && lesson.phrases.length > 0) {
        lesson.phrases.forEach((phrase, index) => {
          compiledSteps.push({
            teacherText: `Try this full phrase: "${phrase.text}". It translates to: "${phrase.translation}". Repeat: "${phrase.text}".`,
            teacherTranslation: `Phrase practice: "${phrase.text}"`,
            prompt: `Tap mic and repeat: "${phrase.text}"`,
            expectedUserSpeech: phrase.text,
            speakingScore: index % 2 === 0 ? "Excellent" : "Great",
            pronunciationScore: "Great",
            grammarScore: index % 2 === 0 ? "Good" : "Excellent",
          });
        });
      }

      // Wrap Up Step
      compiledSteps.push({
        teacherText: lesson.aiTeacherPrompt.wrapUpPrompt || "Fantastic job! You've successfully finished today's audio lesson.",
        teacherTranslation: "You've completed the curriculum. Well done!",
        prompt: "Lesson complete! Tap End Call to finish.",
        expectedUserSpeech: "",
        speakingScore: "Excellent",
        pronunciationScore: "Excellent",
        grammarScore: "Excellent",
      });
    }

    return compiledSteps;
  }, [lesson, language]);

  // Connect simulation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("connected");
      setIsTeacherSpeaking(true);
      triggerHaptic(Haptics.NotificationFeedbackType.Success);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Pulse animation for teacher speaker icon or waveforms
  useEffect(() => {
    if (isTeacherSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTeacherSpeaking, pulseAnim]);

  // User Speaking Soundwaves Simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUserSpeaking) {
      interval = setInterval(() => {
        Animated.parallel([
          Animated.timing(waveAnim1, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim2, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim3, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }, 150);
    } else {
      waveAnim1.setValue(0.2);
      waveAnim2.setValue(0.4);
      waveAnim3.setValue(0.3);
    }
    return () => clearInterval(interval);
  }, [isUserSpeaking, waveAnim1, waveAnim2, waveAnim3]);

  const triggerHaptic = (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.notificationAsync(type);
    }
  };

  const triggerImpact = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(style);
    }
  };

  const handleMicPress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    setIsMuted(!isMuted);
  };

  const handleCameraPress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    setIsCameraOn(!isCameraOn);
  };

  const handleSubtitlesPress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    setShowSubtitles(!showSubtitles);
  };

  // Simulate speaking and advancing to the next step
  const simulateUserSpeech = () => {
    if (isMuted || isUserSpeaking || isTeacherSpeaking) return;

    triggerImpact(Haptics.ImpactFeedbackStyle.Heavy);
    setIsUserSpeaking(true);
    setUserSpokenText("");

    // Simulate recognition of spoken words after 1s
    setTimeout(() => {
      setUserSpokenText(currentStep.expectedUserSpeech);
    }, 1000);

    // After 2.5 seconds, user is done speaking, teacher analyzes and moves forward
    setTimeout(() => {
      setIsUserSpeaking(false);
      setIsTeacherSpeaking(true);
      triggerHaptic(Haptics.NotificationFeedbackType.Success);

      // Advance step if not at final step
      if (stepIndex < steps.length - 1) {
        setStepIndex((prev) => prev + 1);
      } else {
        // Completed lesson!
        setShowSummary(true);
      }
    }, 2500);
  };

  const handleSpeakerPress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    setIsTeacherSpeaking(true);
    // Simulate teacher speaking for 2 seconds then stopping
    setTimeout(() => {
      setIsTeacherSpeaking(false);
    }, 2000);
  };

  const handleEndCall = () => {
    triggerHaptic(Haptics.NotificationFeedbackType.Warning);
    setShowSummary(true);
  };

  if (!lesson) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "white", paddingHorizontal: 24 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="h3 text-text-primary text-center">Lesson not found</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="mt-6 bg-lingua-purple rounded-2xl py-3 px-6"
        >
          <Text className="h4 text-white">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const currentStep = steps[stepIndex] || {
    teacherText: "",
    teacherTranslation: "",
    prompt: "",
    expectedUserSpeech: "",
    speakingScore: "Pending",
    pronunciationScore: "Pending",
    grammarScore: "Pending",
  };

  // Get current active scores
  const currentSpeakingScore = isMuted ? "Muted" : currentStep.speakingScore;
  const currentPronunciationScore = isMuted ? "Muted" : currentStep.pronunciationScore;
  const currentGrammarScore = isMuted ? "Muted" : currentStep.grammarScore;

  // Tab width for the replica bottom tab bar
  const tabWidth = width / 5;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        zIndex: 30,
      }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center -ml-2 rounded-full active:bg-gray-50"
        >
          <Ionicons name="chevron-back" size={24} color="#001328" />
        </Pressable>

        <View className="flex-1 pl-2">
          <Text className="font-poppins-bold text-[17px] text-text-primary leading-tight">
            AI Teacher
          </Text>
          <View className="flex-row items-center mt-0.5">
            <View className="w-2 h-2 rounded-full mr-1.5 bg-success" />
            <Text className="font-poppins-semibold text-[12px] text-success">
              Online
            </Text>
            {language && (
              <Text className="font-poppins-medium text-[12px] text-text-secondary">
                {" • "}{language.name}
              </Text>
            )}
          </View>
        </View>

        {/* Right Header Buttons */}
        <View className="flex-row items-center gap-2">
          {/* Camera Status Button */}
          <Pressable
            accessibilityRole="button"
            onPress={handleCameraPress}
            className="w-9 h-9 rounded-full border border-gray-100 items-center justify-center active:bg-gray-50"
          >
            <Ionicons
              name={isCameraOn ? "videocam-outline" : "videocam-off-outline"}
              size={18}
              color={isCameraOn ? "#001328" : "#ff4d4f"}
            />
          </Pressable>

          {/* Points/XP Goal Badge */}
          <View className="w-9 h-9 rounded-full border border-gray-100 items-center justify-center">
            <Text className="font-poppins-semibold text-[13px] text-text-primary">12</Text>
          </View>

          {/* Info Button for learning data display */}
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              triggerImpact(Haptics.ImpactFeedbackStyle.Light);
              setShowInfoSheet(true);
            }}
            className="w-9 h-9 rounded-full border border-gray-100 items-center justify-center active:bg-gray-50"
          >
            <Ionicons name="information-circle-outline" size={20} color="#001328" />
          </Pressable>
        </View>
      </View>

      {/* Main Container */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
        
        {/* Main Immersive Call Area Card */}
        <View style={{
          flex: 1,
          borderRadius: 28,
          overflow: "hidden",
          position: "relative",
          borderWidth: 1,
          borderColor: "rgba(229, 231, 235, 0.5)",
          backgroundColor: "#eef2f6",
        }}>
          {/* Blurred Background classroom image */}
          <ImageBackground
            source={{
              uri: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop",
            }}
            blurRadius={15}
            style={StyleSheet.absoluteFillObject}
          />
          <View className="absolute inset-0 bg-black/20" />

          {status === "connecting" ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16 }}>
              <ActivityIndicator size="large" color="#6c4ef5" />
              <Text className="font-poppins-medium text-[16px] text-white">
                Connecting to AI Teacher...
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: "space-between", padding: 20, paddingBottom: 24 }}>
              
              {/* Top Row inside Card: Lesson mode indicator & Progress */}
              <View className="flex-row justify-between items-center z-20">
                <View className="bg-black/35 px-3 py-1.5 rounded-full border border-white/10">
                  <Text className="font-poppins-semibold text-[12px] text-white">
                    {language?.flagEmoji} {lesson.title}
                  </Text>
                </View>
                
                <View className="bg-black/35 px-3 py-1.5 rounded-full border border-white/10">
                  <Text className="font-poppins-medium text-[12px] text-white">
                    Step {stepIndex + 1} / {steps.length}
                  </Text>
                </View>
              </View>


              {/* Mascot waving happily - absolutely positioned to prevent layout push */}
              <View style={{
                position: "absolute",
                top: "20%",
                left: 0,
                right: 0,
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}>
                <Image
                  source={images.mascotWelcome}
                  style={{ width: 140, height: 140 }}
                  contentFit="contain"
                />
              </View>

              {/* Speech bubble & floating controls grouped at the bottom */}
              <View style={{ zIndex: 10, gap: 12, marginTop: "auto" }}>
                
                {/* User Speech Recognition Text / Waveform overlay */}
                {isUserSpeaking && (
                  <View className="items-center">
                    <View className="bg-lingua-purple/95 flex-row items-center px-4 py-2.5 rounded-full gap-2.5 border border-white/20 shadow-md">
                      <Text className="font-poppins-semibold text-[12px] text-white uppercase tracking-wider">
                        {userSpokenText ? "Recognized" : "Listening"}
                      </Text>
                      
                      {userSpokenText ? (
                        <Text className="font-poppins-bold text-[13px] text-white">
                          &quot;{userSpokenText}&quot;
                        </Text>
                      ) : (
                        <View className="flex-row items-center gap-1 h-3.5">
                          <Animated.View
                            style={{ transform: [{ scaleY: waveAnim1 }] }}
                            className="w-1 bg-white rounded-full h-full"
                          />
                          <Animated.View
                            style={{ transform: [{ scaleY: waveAnim2 }] }}
                            className="w-1 bg-white rounded-full h-full"
                          />
                          <Animated.View
                            style={{ transform: [{ scaleY: waveAnim3 }] }}
                            className="w-1 bg-white rounded-full h-full"
                          />
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Teacher response chat bubble */}
                <View className="bg-white rounded-[20px] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.12)] relative">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 pr-6">
                      {/* Teacher's text (Target Language) */}
                      <Text className="font-poppins-bold text-[17px] text-text-primary leading-[24px]">
                        {currentStep.teacherText}
                      </Text>

                      {/* Subtitle Translation (English) */}
                      {showSubtitles && (
                        <Text className="font-poppins-medium text-[13px] text-text-secondary mt-1.5 leading-[18px]">
                          {currentStep.teacherTranslation}
                        </Text>
                      )}
                    </View>

                    {/* Audio Speaker Icon */}
                    <Pressable
                      accessibilityRole="button"
                      onPress={handleSpeakerPress}
                      className="w-9 h-9 rounded-full bg-[#f0ecfe] items-center justify-center active:opacity-85 -mr-1"
                    >
                      <Animated.View
                        style={{
                          transform: [{ scale: pulseAnim }],
                        }}
                      >
                        <Ionicons
                          name={isTeacherSpeaking ? "volume-high" : "volume-medium-outline"}
                          size={18}
                          color="#6c4ef5"
                        />
                      </Animated.View>
                    </Pressable>
                  </View>

                  {/* Speech Bubble Tail */}
                  <View
                    style={{
                      position: "absolute",
                      bottom: -8,
                      left: 50,
                      width: 16,
                      height: 16,
                      backgroundColor: "white",
                      transform: [{ rotate: "45deg" }],
                      zIndex: -1,
                    }}
                  />
                </View>

                {/* Prompt Instruction overlay */}
                <View className="items-center">
                  <Text className="font-poppins-semibold text-[13px] text-white text-center px-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    {currentStep.prompt}
                  </Text>
                </View>

                {/* Floating controls inside the card */}
                <View style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  alignItems: "center",
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: "rgba(255, 255, 255, 0.1)",
                }}>
                  {/* Camera Control */}
                  <View className="items-center gap-1.5">
                    <Pressable
                      accessibilityRole="button"
                      onPress={handleCameraPress}
                      className={`w-14 h-14 rounded-full items-center justify-center active:opacity-80 ${
                        isCameraOn ? "bg-white" : "bg-white/20 border border-white/20"
                      }`}
                    >
                      <Ionicons
                        name={isCameraOn ? "videocam" : "videocam-off"}
                        size={24}
                        color={isCameraOn ? "#0A1C3F" : "#ffffff"}
                      />
                    </Pressable>
                    <Text className="font-poppins-medium text-[11px] text-white/95">Camera</Text>
                  </View>

                  {/* Mic Control */}
                  <View className="items-center gap-1.5">
                    <Pressable
                      accessibilityRole="button"
                      onPress={simulateUserSpeech}
                      onLongPress={handleMicPress}
                      className={`w-14 h-14 rounded-full items-center justify-center active:opacity-80 ${
                        isMuted
                          ? "bg-[#FF4D4F]"
                          : isUserSpeaking
                          ? "bg-lingua-purple border border-white/20"
                          : "bg-white"
                      }`}
                    >
                      <Ionicons
                        name={isMuted ? "mic-off" : "mic"}
                        size={24}
                        color={isMuted || isUserSpeaking ? "#ffffff" : "#0A1C3F"}
                      />
                    </Pressable>
                    <Text className="font-poppins-medium text-[11px] text-white/95">
                      {isMuted ? "Muted" : isUserSpeaking ? "Speaking" : "Mic"}
                    </Text>
                  </View>

                  {/* Subtitles Control */}
                  <View className="items-center gap-1.5">
                    <Pressable
                      accessibilityRole="button"
                      onPress={handleSubtitlesPress}
                      className={`w-14 h-14 rounded-full items-center justify-center active:opacity-80 ${
                        showSubtitles ? "bg-white" : "bg-white/20 border border-white/20"
                      }`}
                    >
                      <Ionicons
                        name="language"
                        size={24}
                        color={showSubtitles ? "#0A1C3F" : "#ffffff"}
                      />
                    </Pressable>
                    <Text className="font-poppins-medium text-[11px] text-white/95">Subtitles</Text>
                  </View>

                  {/* End Call Control */}
                  <View className="items-center gap-1.5">
                    <Pressable
                      accessibilityRole="button"
                      onPress={handleEndCall}
                      className="w-14 h-14 rounded-full bg-[#FF4D4F] items-center justify-center active:opacity-80"
                    >
                      <Ionicons
                        name="call"
                        size={24}
                        color="#ffffff"
                        style={{ transform: [{ rotate: "135deg" }] }}
                      />
                    </Pressable>
                    <Text className="font-poppins-medium text-[11px] text-white/95">End Call</Text>
                  </View>
                </View>

              </View>

            </View>
          )}
        </View>

        {/* Lesson Session Status / Live Feedback Card */}
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: "#f3f4f6",
          marginTop: 16,
        }}>
          {/* Speaking Score Column */}
          <View className="flex-1 items-center">
            <Text className="font-poppins-medium text-[9px] text-text-secondary uppercase tracking-wider text-center">
              Speaking
            </Text>
            <Text
              className={`font-poppins-bold text-[14px] mt-1.5 ${
                currentSpeakingScore === "Excellent"
                  ? "text-success"
                  : currentSpeakingScore === "Great"
                  ? "text-lingua-blue"
                  : currentSpeakingScore === "Good"
                  ? "text-lingua-purple"
                  : currentSpeakingScore === "Muted"
                  ? "text-error"
                  : "text-text-secondary"
              }`}
            >
              {currentSpeakingScore}
            </Text>
          </View>

          {/* Divider */}
          <View style={{ width: 1, height: 32, backgroundColor: "#f3f4f6" }} />

          {/* Pronunciation Column */}
          <View className="flex-1 items-center">
            <Text className="font-poppins-medium text-[9px] text-text-secondary uppercase tracking-wider text-center">
              Pronunciation
            </Text>
            <Text
              className={`font-poppins-bold text-[14px] mt-1.5 ${
                currentPronunciationScore === "Excellent"
                  ? "text-success"
                  : currentPronunciationScore === "Great"
                  ? "text-lingua-blue"
                  : currentPronunciationScore === "Good"
                  ? "text-lingua-purple"
                  : currentPronunciationScore === "Muted"
                  ? "text-error"
                  : "text-text-secondary"
              }`}
            >
              {currentPronunciationScore}
            </Text>
          </View>

          {/* Divider */}
          <View style={{ width: 1, height: 32, backgroundColor: "#f3f4f6" }} />

          {/* Grammar Column */}
          <View className="flex-1 items-center">
            <Text className="font-poppins-medium text-[9px] text-text-secondary uppercase tracking-wider text-center">
              Grammar
            </Text>
            <Text
              className={`font-poppins-bold text-[14px] mt-1.5 ${
                currentGrammarScore === "Excellent"
                  ? "text-success"
                  : currentGrammarScore === "Great"
                  ? "text-lingua-blue"
                  : currentGrammarScore === "Good"
                  ? "text-lingua-purple"
                  : currentGrammarScore === "Muted"
                  ? "text-error"
                  : "text-text-secondary"
              }`}
            >
              {currentGrammarScore}
            </Text>
          </View>
        </View>

      </View>

      {/* Info Sheet (Slide Up Panel) showing Goals, Target Phrases, Vocab and Context */}
      {showInfoSheet && (
        <View className="absolute inset-0 bg-black/50 z-40 justify-end">
          <Pressable className="absolute inset-0" onPress={() => setShowInfoSheet(false)} />
          
          <View className="bg-white rounded-t-[32px] p-6 max-h-[80%] shadow-2xl">
            {/* Grabber */}
            <View className="w-12 h-1.5 bg-gray-200 rounded-full align-self-center mx-auto mb-4" />

            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="h3 text-text-primary">{lesson.title}</Text>
                <Text className="font-poppins-semibold text-[13px] text-lingua-purple mt-0.5">
                  {language?.flagEmoji} {language?.name} Lesson
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowInfoSheet(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#001328" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
              {/* Goals */}
              {lesson.goals && lesson.goals.length > 0 && (
                <View className="mb-5">
                  <Text className="font-poppins-bold text-[14px] text-text-primary uppercase tracking-wider mb-2">
                    Lesson Goals
                  </Text>
                  {lesson.goals.map((g) => (
                    <View key={g.id} className="flex-row items-start gap-2.5 mb-1.5">
                      <Ionicons name="checkmark-circle" size={18} color="#21C16B" className="mt-0.5" />
                      <Text className="font-poppins text-[13px] text-text-primary flex-1">
                        {g.text}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Target Phrases */}
              {lesson.phrases && lesson.phrases.length > 0 && (
                <View className="mb-5">
                  <Text className="font-poppins-bold text-[14px] text-text-primary uppercase tracking-wider mb-2.5">
                    Target Phrases
                  </Text>
                  <View className="gap-2.5">
                    {lesson.phrases.map((phrase) => (
                      <View
                        key={phrase.id}
                        className="bg-surface rounded-xl p-3.5 border border-gray-100"
                      >
                        <Text className="font-poppins-bold text-[15px] text-text-primary">
                          {phrase.text}
                        </Text>
                        <Text className="font-poppins-medium text-[13px] text-text-secondary mt-0.5">
                          {phrase.translation}
                        </Text>
                        {phrase.pronunciationHint && (
                          <Text className="font-poppins text-[11px] text-[#6c4ef5] mt-1 italic">
                            Pronunciation: {phrase.pronunciationHint}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Vocabulary */}
              {lesson.vocabulary && lesson.vocabulary.length > 0 && (
                <View className="mb-5">
                  <Text className="font-poppins-bold text-[14px] text-text-primary uppercase tracking-wider mb-2.5">
                    Vocabulary Words
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {lesson.vocabulary.map((vocab) => (
                      <View
                        key={vocab.id}
                        className="bg-white border border-gray-200/80 rounded-xl px-3 py-2 items-center"
                      >
                        <Text className="font-poppins-bold text-[14px] text-text-primary">
                          {vocab.term}
                        </Text>
                        <Text className="font-poppins text-[12px] text-text-secondary mt-0.5">
                          {vocab.translation}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* AI Teacher Persona */}
              {lesson.aiTeacherPrompt && (
                <View className="mb-4">
                  <Text className="font-poppins-bold text-[14px] text-text-primary uppercase tracking-wider mb-2">
                    Teacher Persona
                  </Text>
                  <View className="bg-[#f0ecfe] rounded-xl p-4 border border-[#e5ddfc]">
                    <Text className="font-poppins text-[13px] text-text-primary leading-[18px]">
                      {lesson.aiTeacherPrompt.persona}
                    </Text>
                    <Text className="font-poppins text-[12px] text-text-secondary mt-2 leading-[16px]">
                      <Text className="font-poppins-bold">Instructions: </Text>
                      {lesson.aiTeacherPrompt.lessonBrief}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              onPress={() => setShowInfoSheet(false)}
              className="bg-lingua-purple rounded-2xl py-3.5 items-center justify-center active:bg-lingua-deep-purple mt-auto shadow-sm"
            >
              <Text className="font-poppins-bold text-[15px] text-white uppercase">Close</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Summary / Completed Session Overlay */}
      {showSummary && (
        <View className="absolute inset-0 bg-white z-50 px-6 py-12 justify-between">
          <View className="flex-1 items-center justify-center gap-6">
            <Image
              source={images.mascotWelcome}
              className="w-[180px] h-[180px]"
              contentFit="contain"
            />
            
            <View className="items-center">
              <Text className="h2 text-text-primary text-center">Lesson Completed!</Text>
              <Text className="font-poppins text-[14px] text-text-secondary text-center mt-2.5 px-4 leading-[20px]">
                You practiced {language?.name} with your AI Teacher. Great progress!
              </Text>
            </View>

            {/* Reward Card */}
            <View className="bg-surface rounded-2xl p-5 border border-gray-100 flex-row items-center justify-between w-full max-w-[320px]">
              <View className="flex-row items-center gap-3">
                <Image
                  source={images.streakFire}
                  className="w-10 h-10"
                  contentFit="contain"
                />
                <View>
                  <Text className="font-poppins-bold text-[16px] text-text-primary">XP Reward</Text>
                  <Text className="font-poppins text-[12px] text-text-secondary">Curriculum points</Text>
                </View>
              </View>
              <Text className="font-poppins-bold text-[20px] text-[#ff8a00]">+{lesson.xpReward} XP</Text>
            </View>

            {/* Core Stats overview */}
            <View className="w-full max-w-[320px] gap-2.5">
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="font-poppins-medium text-[13px] text-text-secondary">Speaking Skill</Text>
                <Text className="font-poppins-bold text-[13px] text-success">Excellent</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="font-poppins-medium text-[13px] text-text-secondary">Pronunciation</Text>
                <Text className="font-poppins-bold text-[13px] text-[#4d88ff]">Great</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="font-poppins-medium text-[13px] text-text-secondary">Grammar Mastery</Text>
                <Text className="font-poppins-bold text-[13px] text-[#6c4ef5]">Good</Text>
              </View>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              triggerHaptic(Haptics.NotificationFeedbackType.Success);
              router.back();
            }}
            className="bg-lingua-purple rounded-2xl py-4 items-center justify-center active:bg-lingua-deep-purple shadow-[0_4px_0_#5B3BF6]"
          >
            <Text className="font-poppins-bold text-[15px] text-white uppercase tracking-wide">
              Return to Curriculum
            </Text>
          </Pressable>
        </View>
      )}

      {/* Bottom Tab Navigation Bar Replica */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
          paddingTop: 16,
          position: "relative",
        }}
      >
        {/* Animated Circle Indicator positioned at Learn tab (index 1) */}
        <View
          style={{
            position: "absolute",
            top: 16,
            left: tabWidth * 1,
            width: tabWidth,
            height: 56,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 0,
          }}
        >
          <View className="w-14 h-14 bg-lingua-purple rounded-full" />
        </View>

        {/* Home Tab */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/(tabs)")}
          className="flex-1 items-center justify-center z-10"
          style={{ height: 56 }}
        >
          <Ionicons name="home-outline" size={24} color="#68728d" />
          <Text className="font-poppins-medium text-[10px] mt-1 text-[#68728d]">Home</Text>
        </Pressable>

        {/* Learn Tab (Active) */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/(tabs)/learn")}
          className="flex-1 items-center justify-center z-10"
          style={{ height: 56 }}
        >
          <Ionicons name="book" size={24} color="#ffffff" />
        </Pressable>

        {/* AI Teacher Tab */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/(tabs)/ai")}
          className="flex-1 items-center justify-center z-10"
          style={{ height: 56 }}
        >
          <Ionicons name="planet-outline" size={24} color="#68728d" />
          <Text className="font-poppins-medium text-[10px] mt-1 text-[#68728d]">AI Teacher</Text>
        </Pressable>

        {/* Chat Tab */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/(tabs)/chat")}
          className="flex-1 items-center justify-center z-10"
          style={{ height: 56 }}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#68728d" />
          <Text className="font-poppins-medium text-[10px] mt-1 text-[#68728d]">Chat</Text>
        </Pressable>

        {/* Profile Tab */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/(tabs)/profile")}
          className="flex-1 items-center justify-center z-10"
          style={{ height: 56 }}
        >
          <Ionicons name="person-outline" size={24} color="#68728d" />
          <Text className="font-poppins-medium text-[10px] mt-1 text-[#68728d]">Profile</Text>
        </Pressable>
      </View>

    </SafeAreaView>
  );
}

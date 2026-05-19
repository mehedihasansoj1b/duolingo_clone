import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type LessonState = {
  hasHydrated: boolean;
  activeLessonIndex: number;
  setHasHydrated: (hasHydrated: boolean) => void;
  setActiveLessonIndex: (index: number) => void;
};

export const useLessonStore = create<LessonState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      activeLessonIndex: 2, // Default to 2 to match the mock active lesson index
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setActiveLessonIndex: (index) => set({ activeLessonIndex: index }),
    }),
    {
      name: "lesson-progress",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        activeLessonIndex: state.activeLessonIndex,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

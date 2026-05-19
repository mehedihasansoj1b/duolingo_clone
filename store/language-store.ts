import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { LanguageCode } from "@/types/learning";

type LanguageState = {
  hasHydrated: boolean;
  selectedLanguageId: LanguageCode | null;
  clearSelectedLanguage: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setSelectedLanguage: (languageId: LanguageCode) => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      selectedLanguageId: null,
      clearSelectedLanguage: () => set({ selectedLanguageId: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setSelectedLanguage: (languageId) =>
        set({ selectedLanguageId: languageId }),
    }),
    {
      name: "language-selection",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        selectedLanguageId: state.selectedLanguageId,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

import { create } from "zustand";
import { THEMES } from "../themeConstant";

const DEFAULT_THEME = "dracula";

const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem("chat-theme");
    if (THEMES.includes(savedTheme)) return savedTheme;
    localStorage.setItem("chat-theme", DEFAULT_THEME);
  } catch {
    return DEFAULT_THEME;
  }
  return DEFAULT_THEME;
};

export const useThemeStore = create((set) => ({
    theme: getInitialTheme(),

    setTheme: (theme) => {
        if (!THEMES.includes(theme)) return;
        try {
          localStorage.setItem("chat-theme", theme);
        } catch {
          // Keep the current theme for this session if storage is unavailable.
        }
        set({ theme });
    }
}));

import Storage from "expo-sqlite/kv-store";
import { Uniwind, useUniwind } from "uniwind";

export type ColorMode = "system" | "light" | "dark";

const storageKey = "color-mode";

/** Applies the saved color mode. Call it once, before the first render. */
export function restoreColorMode() {
  const saved = Storage.getItemSync(storageKey);
  if (saved === "light" || saved === "dark") {
    Uniwind.setTheme(saved);
  }
}

export function setColorMode(colorMode: ColorMode) {
  Uniwind.setTheme(colorMode);
  Storage.setItemSync(storageKey, colorMode);
}

export function useColorMode(): ColorMode {
  const { theme, hasAdaptiveThemes } = useUniwind();
  return hasAdaptiveThemes ? "system" : theme;
}

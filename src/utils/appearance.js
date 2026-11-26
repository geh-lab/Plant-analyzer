export const scales = [85, 100, 115, 130, 150];
export const displayKey = "geh-display-v1";
const themes = ["system", "light", "dark"];

export function normalizeDisplay(value) {
  return {
    theme: themes.includes(value?.theme) ? value.theme : "system",
    scale: scales.includes(value?.scale) ? value.scale : 100
  };
}

export function readDisplay() {
  try { return normalizeDisplay(JSON.parse(localStorage.getItem(displayKey))); }
  catch { return normalizeDisplay(null); }
}

export function applyDisplay(preferences) {
  const dark = preferences.theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches : preferences.theme === "dark";
  const root = document.documentElement;
  root.dataset.theme = dark ? "dark" : "light";
  root.classList.toggle("dark", dark);
  root.style.fontSize = preferences.scale + "%";
  root.style.setProperty("--type-scale", String(preferences.scale / 100));
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#15201c" : "#f6f8f4");
}

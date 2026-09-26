import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('stocksense_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  }
  return 'dark'; // Default sleek dark theme
};

const applyThemeToDOM = (theme) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('stocksense_theme', theme);
  }
};

// Initial run
if (typeof window !== 'undefined') {
  applyThemeToDOM(getInitialTheme());
}

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    applyThemeToDOM(next);
    set({ theme: next });
  },
  setTheme: (theme) => {
    applyThemeToDOM(theme);
    set({ theme });
  },
}));

export default useThemeStore;

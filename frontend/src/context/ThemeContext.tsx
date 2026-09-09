import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'midnight' | 'cyberpunk' | 'sapphire' | 'sunset' | 'amethyst' | 'light';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  category: string;
  description: string;
  accentColor: string;
  isDark: boolean;
  palette: {
    bg: string;
    card: string;
    border: string;
    accent: string;
    gradient: string;
  };
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'midnight',
    name: 'Midnight Nebula',
    category: 'Cosmic Dark (Default)',
    description: 'Deep space obsidian with glowing cyan & indigo celestial accents',
    accentColor: '#38bdf8',
    isDark: true,
    palette: {
      bg: '#0b0f19',
      card: '#1e293b',
      border: 'rgba(56, 189, 248, 0.2)',
      accent: '#38bdf8',
      gradient: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Matrix',
    category: 'Hacker Terminal',
    description: 'Pitch cyber black with luminescent emerald, mint & neon lime glow',
    accentColor: '#10b981',
    isDark: true,
    palette: {
      bg: '#030b06',
      card: '#062612',
      border: 'rgba(16, 185, 129, 0.3)',
      accent: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #00f59b 50%, #84cc16 100%)',
    },
  },
  {
    id: 'sapphire',
    name: 'Deep Sapphire',
    category: 'Oceanic Abyss',
    description: 'Abyssal midnight navy with radiant electric blue & azure currents',
    accentColor: '#0ea5e9',
    isDark: true,
    palette: {
      bg: '#020b1a',
      card: '#0a204a',
      border: 'rgba(14, 165, 233, 0.3)',
      accent: '#0ea5e9',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%)',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Ember',
    category: 'Crimson & Flame',
    description: 'Obsidian rose wine with radiant ruby, fiery ember & golden warmth',
    accentColor: '#f43f5e',
    isDark: true,
    palette: {
      bg: '#12070d',
      card: '#361023',
      border: 'rgba(244, 63, 94, 0.3)',
      accent: '#f43f5e',
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 50%, #facc15 100%)',
    },
  },
  {
    id: 'amethyst',
    name: 'Amethyst Dream',
    category: 'Royal Purple',
    description: 'Deep gothic violet with luminous lavender, amethyst & magenta aurora',
    accentColor: '#c084fc',
    isDark: true,
    palette: {
      bg: '#0e071a',
      card: '#2b124c',
      border: 'rgba(192, 132, 252, 0.3)',
      accent: '#c084fc',
      gradient: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #ec4899 100%)',
    },
  },
  {
    id: 'light',
    name: 'Solar Clean',
    category: 'Architectural Light',
    description: 'Crisp porcelain canvas with royal indigo & deep slate typography',
    accentColor: '#2563eb',
    isDark: false,
    palette: {
      bg: '#f8fafc',
      card: '#ffffff',
      border: 'rgba(203, 213, 225, 0.8)',
      accent: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
    },
  },
];

interface ThemeContextType {
  theme: ThemeId;
  currentTheme: ThemeOption;
  setTheme: (theme: ThemeId) => void;
  cycleTheme: () => void;
  availableThemes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'ai_career_app_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
      if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
        return saved;
      }
    }
    return 'midnight';
  });

  const currentTheme = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // ignore local storage errors
    }
  };

  const cycleTheme = () => {
    const currentIndex = THEME_OPTIONS.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
    setTheme(THEME_OPTIONS[nextIndex].id);
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Set data-theme attribute
    root.setAttribute('data-theme', theme);
    body.setAttribute('data-theme', theme);

    // Update dark/light class for standard CSS selectors
    if (currentTheme.isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Set theme-specific class
    THEME_OPTIONS.forEach((t) => {
      root.classList.remove(`theme-${t.id}`);
      body.classList.remove(`theme-${t.id}`);
    });
    root.classList.add(`theme-${theme}`);
    body.classList.add(`theme-${theme}`);

    // Update meta theme-color for browser address bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', currentTheme.palette.bg);
    }
  }, [theme, currentTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentTheme,
        setTheme,
        cycleTheme,
        availableThemes: THEME_OPTIONS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Moon,
  Terminal,
  Droplets,
  Flame,
  Sparkles,
  Sun,
  Check,
  ChevronDown,
  RotateCw,
} from 'lucide-react';
import { useTheme, ThemeId, ThemeOption } from '../context/ThemeContext';

const getThemeIcon = (id: ThemeId, className = 'w-4 h-4') => {
  switch (id) {
    case 'midnight':
      return <Moon className={className} />;
    case 'cyberpunk':
      return <Terminal className={className} />;
    case 'sapphire':
      return <Droplets className={className} />;
    case 'sunset':
      return <Flame className={className} />;
    case 'amethyst':
      return <Sparkles className={className} />;
    case 'light':
      return <Sun className={className} />;
    default:
      return <Palette className={className} />;
  }
};

export const ThemeToggle: React.FC = () => {
  const { theme, currentTheme, setTheme, cycleTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center gap-1" ref={dropdownRef}>
      {/* Quick Cycle Button */}
      <button
        onClick={cycleTheme}
        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors border border-transparent hover:border-slate-700/60 cursor-pointer"
        title="Quick-cycle to next theme"
        aria-label="Quick-cycle theme"
      >
        <RotateCw className="w-3.5 h-3.5" />
      </button>

      {/* Main Theme Selector Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold glass-card hover:border-slate-600/80 transition-all cursor-pointer shadow-sm group"
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={`Current Theme: ${currentTheme.name} (Click to customize)`}
      >
        {/* Animated Accent Color Dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ backgroundColor: currentTheme.accentColor }}
          />
          <span
            className="relative inline-flex rounded-full h-2.5 w-2.5"
            style={{ backgroundColor: currentTheme.accentColor }}
          />
        </span>

        {/* Icon & Theme Name */}
        <span className="text-slate-300 group-hover:text-white transition-colors flex items-center gap-1.5">
          {getThemeIcon(theme, 'w-3.5 h-3.5')}
          <span className="hidden md:inline font-medium">{currentTheme.name}</span>
        </span>

        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl glass-panel p-4 shadow-2xl border border-slate-700/80 z-50 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">
                    Visual Theme Suite
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    6 Handcrafted Aesthetic Palettes
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {availableThemes.length} Styles
              </span>
            </div>

            {/* Theme Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {availableThemes.map((option: ThemeOption) => {
                const isSelected = option.id === theme;

                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      setTheme(option.id);
                      setIsOpen(false);
                    }}
                    className={`relative text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'border-indigo-500/80 bg-slate-800/90 shadow-lg shadow-indigo-500/10'
                        : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-850'
                    }`}
                  >
                    {/* Header Row: Icon, Title & Active Checkmark */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-white font-semibold text-xs">
                          <span
                            className="p-1 rounded-md"
                            style={{
                              backgroundColor: `${option.accentColor}20`,
                              color: option.accentColor,
                            }}
                          >
                            {getThemeIcon(option.id, 'w-3.5 h-3.5')}
                          </span>
                          <span className="group-hover:text-sky-300 transition-colors">
                            {option.name}
                          </span>
                        </div>

                        {isSelected && (
                          <span
                            className="flex items-center justify-center w-4 h-4 rounded-full text-white shadow-sm"
                            style={{ backgroundColor: option.accentColor }}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      {/* Category Label */}
                      <span className="text-[10px] font-medium text-slate-400 block mb-2">
                        {option.category}
                      </span>

                      {/* Description */}
                      <p className="text-[11px] text-slate-400/90 leading-tight mb-3 line-clamp-2">
                        {option.description}
                      </p>
                    </div>

                    {/* Color Swatch Preview Bar */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-inner"
                          style={{ backgroundColor: option.palette.bg }}
                          title={`Background: ${option.palette.bg}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: option.palette.card }}
                          title={`Card: ${option.palette.card}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: option.accentColor }}
                          title={`Accent: ${option.accentColor}`}
                        />
                      </div>

                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                        style={{
                          borderColor: `${option.accentColor}40`,
                          color: option.accentColor,
                          backgroundColor: `${option.accentColor}10`,
                        }}
                      >
                        {option.isDark ? 'Dark' : 'Light'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Cycle Footer Hint */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Tip: Click ↻ to cycle anytime</span>
              <button
                onClick={() => {
                  cycleTheme();
                  setIsOpen(false);
                }}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
              >
                Next Theme →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

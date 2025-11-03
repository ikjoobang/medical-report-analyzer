import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-primary dark:bg-primary-dark text-white shadow-lg hover:scale-110 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
};

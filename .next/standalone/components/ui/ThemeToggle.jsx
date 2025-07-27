'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import Button from './Button';

const ThemeToggle = ({ 
  className = "",
  size = "sm",
  variant = "ghost",
  showLabel = false 
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={`transition-all duration-200 ${className}`}
      icon={isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {showLabel && (isDark ? 'Light' : 'Dark')}
    </Button>
  );
};

export default ThemeToggle;

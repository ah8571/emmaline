import React, { createContext, useContext } from 'react';

export const lightColors = {
  background: '#f6f7f8',
  surface: '#ffffff',
  surfaceAlt: '#eef1f4',
  text: '#111418',
  mutedText: '#68707a',
  border: '#dde2e7',
  accent: '#0b5fff',
  danger: '#d9485f',
  status: '#0b5fff',
  chipSelectedBg: '#e4edff',
  chipSelectedText: '#123a8f',
  input: '#ffffff',
  backdrop: 'rgba(0,0,0,0.25)'
};

export const darkColors = {
  background: '#050607',
  surface: '#0f1113',
  surfaceAlt: '#171a1e',
  text: '#f5f7fa',
  mutedText: '#a0a8b2',
  border: '#242a31',
  accent: '#89b4ff',
  danger: '#ff7a90',
  status: '#1d4ed8',
  chipSelectedBg: '#1b2f57',
  chipSelectedText: '#d8e6ff',
  input: '#101317',
  backdrop: 'rgba(0,0,0,0.45)'
};

const defaultValue = {
  isDarkMode: false,
  colors: lightColors,
  toggleTheme: () => {}
};

const AppThemeContext = createContext(defaultValue);

export const AppThemeProvider = ({ value, children }) => {
  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
};

export const useAppTheme = () => useContext(AppThemeContext);

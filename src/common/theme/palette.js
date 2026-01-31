import {
  grey
} from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

export default (server, darkMode) => ({
  mode: darkMode ? 'dark' : 'light',
  background: {
    default: darkMode ? '#0f172a' : '#f3f4f6',
    paper: darkMode ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.4)',
    gradient: darkMode
      ? 'radial-gradient(at 0% 0%, rgba(249, 115, 22, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(147, 51, 234, 0.15) 0px, transparent 50%)'
      : 'radial-gradient(at 0% 0%, rgba(249, 115, 22, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(147, 51, 234, 0.15) 0px, transparent 50%)',
  },
  primary: {
    main: validatedColor(server?.attributes?.colorPrimary) || (darkMode ? '#f97316' : '#f97316'),
    light: darkMode ? '#fb923c' : '#f97316',
    dark: darkMode ? '#ea580c' : '#c2410c',
  },
  secondary: {
    main: validatedColor(server?.attributes?.colorSecondary) || (darkMode ? '#34d399' : '#10b981'),
    light: darkMode ? '#6ee7b7' : '#34d399',
    dark: darkMode ? '#10b981' : '#059669',
  },
  neutral: {
    main: grey[500],
  },
  geometry: {
    main: '#3bb2d0',
  },
  alwaysDark: {
    main: grey[900],
  },
  // Modern glassmorphism colors
  glass: {
    background: darkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.6)',
    border: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)',
  },
  // Accent colors for interactive elements
  accent: {
    main: darkMode ? '#a78bfa' : '#8b5cf6',
    hover: darkMode ? '#c4b5fd' : '#a78bfa',
  },
  // Surface colors for layered UI
  surface: {
    elevated: darkMode ? '#1e293b' : '#ffffff',
    overlay: darkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)',
  },
});

import { grey, green, indigo, blue, purple } from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

export default (server, darkMode) => ({
  mode: darkMode ? 'dark' : 'light',
  background: {
    default: darkMode ? 'transparent' : 'transparent',
    paper: darkMode ? 'rgba(30, 28, 41, 0.95)' : '#ffffff',
    gradient: darkMode ? 'linear-gradient(135deg, rgb(31, 26, 66) 0%, rgb(39, 32, 40) 33%, rgb(15, 23, 42) 66%, rgb(15, 23, 42) 100%)' : 'linear-gradient(135deg, rgb(230, 220, 243) 0%, rgb(244, 231, 223) 50%, rgb(243, 244, 246) 100%)',
  },
  primary: {
    main: validatedColor(server?.attributes?.colorPrimary) || (darkMode ? 'rgb(248, 115, 24)' : 'rgb(248, 115, 24)'),
    light: darkMode ? 'rgb(255, 145, 60)' : 'rgb(248, 115, 24)',
    dark: darkMode ? 'rgb(248, 115, 24)' : 'rgb(200, 80, 0)',
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
    background: darkMode ? 'rgba(26, 31, 58, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    border: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  },
  // Accent colors for interactive elements
  accent: {
    main: darkMode ? '#a78bfa' : '#8b5cf6',
    hover: darkMode ? '#c4b5fd' : '#a78bfa',
  },
  // Surface colors for layered UI
  surface: {
    elevated: darkMode ? '#252b4a' : '#ffffff',
    overlay: darkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)',
  },
});

import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import palette from './palette';
import dimensions from './dimensions';
import components from './components';

export default (server, darkMode, direction) => useMemo(() => createTheme({
  typography: {
    fontFamily: 'Inter,Roboto,Segoe UI,Helvetica Neue,Arial,sans-serif',
    fontSize: 13,
    htmlFontSize: 13,
    h6: { fontSize: '1rem' },
    subtitle1: { fontSize: '0.85rem' },
    subtitle2: { fontSize: '0.8rem' },
    body1: { fontSize: '0.85rem' },
    body2: { fontSize: '0.8rem' },
    button: { fontSize: '0.8rem' },
    caption: { fontSize: '0.7rem' },
  },
  palette: palette(server, darkMode),
  direction,
  dimensions,
  components,
}), [server, darkMode, direction]);

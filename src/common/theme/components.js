export default {
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      body: {
        backgroundColor: theme.palette.background.default,
        backgroundImage: theme.palette.background.gradient,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        minHeight: '100vh',
      },
      '#root': {
        backgroundColor: 'transparent',
        minHeight: '100vh',
      },
    }),
  },
  MuiUseMediaQuery: {
    defaultProps: {
      noSsr: true,
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(30, 28, 41, 0.8)'
          : theme.palette.background.paper,
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 12px rgba(248, 115, 24, 0.15)'
            : '0 4px 12px rgba(248, 115, 24, 0.1)',
        },
        '&.Mui-focused': {
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 16px rgba(248, 115, 24, 0.25)'
            : '0 4px 16px rgba(248, 115, 24, 0.15)',
        },
      }),
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '10px',
        textTransform: 'none',
        fontWeight: 500,
        transition: 'all 0.3s ease',
      },
      sizeMedium: {
        height: '40px',
      },
      contained: ({ theme }) => ({
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 12px rgba(248, 115, 24, 0.2)'
          : '0 4px 12px rgba(248, 115, 24, 0.15)',
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark'
            ? '0 6px 20px rgba(248, 115, 24, 0.3)'
            : '0 6px 20px rgba(248, 115, 24, 0.25)',
          transform: 'translateY(-2px)',
        },
      }),
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundImage: 'none',
        backgroundColor: theme.palette.glass.background,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${theme.palette.glass.border}`,
        transition: 'all 0.3s ease',
      }),
      elevation1: ({ theme }) => ({
        boxShadow: theme.palette.mode === 'dark'
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
      }),
      elevation3: ({ theme }) => ({
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 16px rgba(0, 0, 0, 0.4)'
          : '0 4px 16px rgba(0, 0, 0, 0.1)',
      }),
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: '10px',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      },
    },
  },
  MuiFormControl: {
    defaultProps: {
      size: 'small',
    },
  },
  MuiSnackbar: {
    defaultProps: {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      enterDelay: 500,
      enterNextDelay: 500,
    },
    styleOverrides: {
      tooltip: ({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(26, 31, 58, 0.95)'
          : 'rgba(0, 0, 0, 0.87)',
        backdropFilter: 'blur(10px)',
        borderRadius: '8px',
        padding: '8px 12px',
      }),
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        '@media print': {
          color: theme.palette.alwaysDark.main,
        },
      }),
    },
  },
  MuiBottomNavigation: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.glass.background,
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${theme.palette.glass.border}`,
      }),
    },
  },
  MuiBottomNavigationAction: {
    styleOverrides: {
      root: ({ theme }) => ({
        transition: 'all 0.3s ease',
        '&.Mui-selected': {
          color: theme.palette.primary.main,
          transform: 'translateY(-2px)',
        },
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(248, 115, 24, 0.1)'
            : 'rgba(248, 115, 24, 0.05)',
        },
      }),
    },
  },
  MuiPopover: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: theme.palette.glass.background,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${theme.palette.glass.border}`,
        borderRadius: '16px',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 8px 32px rgba(0, 0, 0, 0.5)'
          : '0 8px 32px rgba(0, 0, 0, 0.15)',
      }),
    },
  },
  MuiAccordion: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        borderRadius: '16px !important',
        border: `1px solid ${theme.palette.glass.border}`,
        marginBottom: theme.spacing(2),
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: `0 0 ${theme.spacing(2)} 0`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(248, 115, 24, 0.15)'
            : '0 4px 20px rgba(248, 115, 24, 0.1)',
        },
      }),
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(248, 115, 24, 0.05)'
            : 'rgba(248, 115, 24, 0.03)',
        },
      }),
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
    },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
        },
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      outlined: {
        borderRadius: '12px',
      },
    },
  },
  MuiCheckbox: {
    styleOverrides: {
      root: ({ theme }) => ({
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.1)',
        },
        '&.Mui-checked': {
          color: theme.palette.primary.main,
        },
      }),
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: theme.palette.glass.background,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${theme.palette.glass.border}`,
        borderRadius: '12px',
        marginTop: theme.spacing(1),
      }),
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: '12px',
        marginBottom: theme.spacing(0.5),
        transition: 'all 0.3s ease',
        '&.Mui-selected': {
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(30, 41, 59, 0.5)'
            : theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(30, 41, 59, 0.6)'
              : theme.palette.primary.main,
          },
          '& .MuiListItemIcon-root': {
            color: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#ffffff',
          },
          '& .MuiListItemText-primary': {
            color: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#ffffff',
            fontWeight: 600,
          },
        },
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(241, 245, 249, 0.8)',
        },
      }),
    },
  },
};

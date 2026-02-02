import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Select, MenuItem, Box, FormControl, IconButton, Tooltip
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { sessionActions } from '../store';
import { useLocalization } from '../common/components/LocalizationProvider';
import usePersistedState from '../common/util/usePersistedState';
import {
  generateLoginToken, nativePostMessage,
} from '../common/components/NativeInterface';
import './LoginPage.css';

const LoginPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const { languages, language, setLocalLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({ code: values[0], country: values[1].country, name: values[1].name }));

  const [failed, setFailed] = useState(false);
  const [email, setEmail] = usePersistedState('loginEmail', '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const registrationEnabled = useSelector((state) => state.session.server.registration);
  const emailEnabled = useSelector((state) => state.session.server.emailEnabled);
  const server = useSelector((state) => state.session.server);
  const darkMode = server?.attributes?.darkMode;

  // Handle theme toggle for login page
  const handleThemeToggle = () => {
    const newDarkMode = !darkMode;
    const updatedServer = {
      ...server,
      attributes: {
        ...server.attributes,
        darkMode: newDarkMode,
      },
    };
    dispatch(sessionActions.updateServer(updatedServer));
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setFailed(false);
    try {
      const query = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const response = await fetch('/api/session', {
        method: 'POST',
        body: new URLSearchParams(query),
      });
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        dispatch(sessionActions.updateUser(user));
        const target = window.sessionStorage.getItem('postLogin') || '/';
        window.sessionStorage.removeItem('postLogin');
        navigate(target, { replace: true });
      } else {
        throw Error(await response.text());
      }
    } catch {
      setFailed(true);
      setPassword('');
    }
  };

  useEffect(() => nativePostMessage('authentication'), []);

  // Apply theme colors as CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-bg-default', theme.palette.background.default);
    root.style.setProperty('--theme-bg-paper', theme.palette.background.paper);
    root.style.setProperty('--theme-bg-gradient', theme.palette.background.gradient);
    root.style.setProperty('--theme-surface-elevated', theme.palette.surface.elevated);
    root.style.setProperty('--theme-primary-main', theme.palette.primary.main);
    root.style.setProperty('--theme-primary-dark', theme.palette.primary.dark);
    root.style.setProperty('--theme-text-primary', theme.palette.text.primary);
    root.style.setProperty('--theme-text-secondary', theme.palette.text.secondary);
    root.style.setProperty('--theme-divider', theme.palette.divider);
    root.style.setProperty('--theme-error-main', theme.palette.error.main);
    root.style.setProperty('--theme-glass-bg', theme.palette.glass.background);
    root.style.setProperty('--theme-glass-border', theme.palette.glass.border);
  }, [theme]);

  return (
    <div className={`login-page-container ${theme.palette.mode === 'dark' ? 'dark' : ''}`}>
      {/* Top Hero Section */}
      <div className="login-hero">
        <div
          className="login-hero-bg"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDqJHtswoVJfxXPHacZ-lNEbBm5pJlRFYsSs_d4Sq1taN_so5GdYvdogY4IV91ozkzngPpOFC4zQvNKG8C3O2mztN8gDuxLJ3BGPogQpe0p4EYMvT135lZ6G0VtGxEdBtPosf2BAihieoT92EkeOFMyr3inFMhRVsHx-x4K62mfjfgghy6n3IzQWT1KOyh9TiZ2uizRCwWwVeD1ULgLhac7ToFUDXjAbHfhvoeBwwY1wDE5nnhXNruJzfM1eyOvebcGj37ha_cETQE')",
          }}
        />
        <div className="login-hero-tint" />
        <div className="login-hero-overlay">
          <div className="login-icon-wrapper">
            <span className="material-symbols-outlined login-icon">navigation</span>
          </div>
          <h1 className="login-title">Alhaad Admin</h1>
          <p className="login-subtitle">Fleet Management</p>
        </div>

        {/* Language Selector & Theme Toggle */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {/* Theme Toggle */}
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton
              onClick={handleThemeToggle}
              sx={{
                color: theme.palette.primary.main,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'rotate(180deg)',
                  backgroundColor: `${theme.palette.primary.main}1A`,
                },
              }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Language Selector */}
          <FormControl
            size="small"
            sx={{
              minWidth: 120,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backdropFilter: 'blur(16px)',
                background: theme.palette.glass.background,
                border: `1px solid ${theme.palette.glass.border}`,
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
          >
            <Select
              value={language}
              onChange={(e) => setLocalLanguage(e.target.value)}
              startAdornment={<LanguageIcon sx={{ mr: 1, fontSize: '1.125rem', color: theme.palette.primary.main }} />}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              {languageList.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </div>

      {/* Login Form Card */}
      <div className="login-form-card">
        <div className="login-form-inner">
          <div className="login-form-handle" />

          <h2 className="login-form-title">Welcome Back</h2>
          <p className="login-form-description">
            Enter your credentials to access your dashboard.
          </p>

          <form onSubmit={handlePasswordLogin} className="login-form">
            {/* Email Input */}
            <div className="login-input-group">
              <label className="login-input-label">
                <p className="login-label-text">
                  Email Address
                </p>
                <div className="login-input-wrapper">
                  <span className="material-symbols-outlined login-input-icon">
                    mail
                  </span>
                  <input
                    className="login-input"
                    placeholder="admin@alhaad.com"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (failed) setFailed(false);
                    }}
                    required
                  />
                </div>
              </label>
            </div>

            {/* Password Input */}
            <div className="login-input-group">
              <label className="login-input-label">
                <p className="login-label-text">
                  Password
                </p>
                <div className="login-input-wrapper">
                  <span className="material-symbols-outlined login-input-icon">
                    lock
                  </span>
                  <input
                    className="login-input login-input-password"
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (failed) setFailed(false);
                    }}
                    required
                  />
                  <button
                    className="login-password-toggle"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </label>
            </div>

            {/* Error Message */}
            {failed && (
              <div className="login-error">
                Invalid email or password
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="login-options">
              <label className="login-remember">
                <input
                  className="login-checkbox"
                  type="checkbox"
                />
                <span className="login-remember-text">
                  Remember me
                </span>
              </label>
              {emailEnabled && (
                <a
                  className="login-forgot-link"
                  onClick={() => navigate('/reset-password')}
                >
                  Forgot Password?
                </a>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={!email || !password}
            >
              Login to Alhaad
            </button>

            {/* Register Link */}
            {registrationEnabled && (
              <div className="login-register">
                <p className="login-register-text">
                  Don't have an account?
                  <a
                    className="login-register-link"
                    onClick={() => navigate('/register')}
                  >
                    Register Fleet
                  </a>
                </p>
              </div>
            )}

            {/* Security Badge */}
            <div className="login-security-badge">
              <span className="material-symbols-outlined" style={{ fontSize: '0.75rem', color: theme.palette.primary.main }}>verified_user</span>
              <span className="login-security-badge-text">
                Enterprise Secure Access
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

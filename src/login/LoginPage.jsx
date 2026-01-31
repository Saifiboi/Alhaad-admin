import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sessionActions } from '../store';
import { useLocalization, useTranslation } from '../common/components/LocalizationProvider';
import usePersistedState from '../common/util/usePersistedState';
import {
  generateLoginToken, nativePostMessage,
} from '../common/components/NativeInterface';
import './LoginPage.css';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const { languages, language, setLocalLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({ code: values[0], country: values[1].country, name: values[1].name }));

  const [failed, setFailed] = useState(false);
  const [email, setEmail] = usePersistedState('loginEmail', '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = usePersistedState('darkMode', true);

  const registrationEnabled = useSelector((state) => state.session.server.registration);
  const emailEnabled = useSelector((state) => state.session.server.emailEnabled);

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

  return (
    <div className={`login-page-container ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Hero Section */}
      <div className="login-hero">
        <div
          className="login-hero-bg"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDqJHtswoVJfxXPHacZ-lNEbBm5pJlRFYsSs_d4Sq1taN_so5GdYvdogY4IV91ozkzngPpOFC4zQvNKG8C3O2mztN8gDuxLJ3BGPogQpe0p4EYMvT135lZ6G0VtGxEdBtPosf2BAihieoT92EkeOFMyr3inFMhRVsHx-x4K62mfjfgghy6n3IzQWT1KOyh9TiZ2uizRCwWwVeD1ULgLhac7ToFUDXjAbHfhvoeBwwY1wDE5nnhXNruJzfM1eyOvebcGj37ha_cETQE')",
          }}
        />
        <div className="login-hero-tint" />
        <div className={`login-hero-overlay ${isDarkMode ? 'dark' : ''}`}>
          <div className={`login-icon-wrapper ${isDarkMode ? 'dark' : ''}`}>
            <span className="material-symbols-outlined login-icon">navigation</span>
          </div>
          <h1 className="login-title">Alhaad Admin</h1>
          <p className="login-subtitle">Fleet Management</p>
        </div>

        {/* Language Selector & Theme Toggle */}
        <div className="login-controls">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`login-control-btn ${isDarkMode ? 'dark' : ''}`}
            type="button"
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined login-icon" style={{ fontSize: '1.125rem' }}>
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <div className={`login-lang-selector ${isDarkMode ? 'dark' : ''}`}>
            <span className="material-symbols-outlined login-icon" style={{ fontSize: '0.875rem' }}>language</span>
            <select
              className={`login-lang-select ${isDarkMode ? 'dark' : ''}`}
              value={language}
              onChange={(e) => setLocalLanguage(e.target.value)}
            >
              {languageList.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Login Form Card */}
      <div className={`login-form-card ${isDarkMode ? 'dark' : ''}`}>
        <div className="login-form-inner">
          <div className={`login-form-handle ${isDarkMode ? 'dark' : ''}`} />

          <h2 className={`login-form-title ${isDarkMode ? 'dark' : ''}`}>Welcome Back</h2>
          <p className={`login-form-description ${isDarkMode ? 'dark' : ''}`}>
            Enter your credentials to access your dashboard.
          </p>

          <form onSubmit={handlePasswordLogin} className="login-form">
            {/* Email Input */}
            <div className="login-input-group">
              <label className="login-input-label">
                <p className={`login-label-text ${isDarkMode ? 'dark' : ''}`}>
                  Email Address
                </p>
                <div className="login-input-wrapper">
                  <span className={`material-symbols-outlined login-input-icon ${isDarkMode ? 'dark' : ''}`}>
                    mail
                  </span>
                  <input
                    className={`login-input ${isDarkMode ? 'dark' : ''}`}
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
                <p className={`login-label-text ${isDarkMode ? 'dark' : ''}`}>
                  Password
                </p>
                <div className="login-input-wrapper">
                  <span className={`material-symbols-outlined login-input-icon ${isDarkMode ? 'dark' : ''}`}>
                    lock
                  </span>
                  <input
                    className={`login-input login-input-password ${isDarkMode ? 'dark' : ''}`}
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (failed) setFailed(false);
                    }}
                    required
                  />
                  <button
                    className={`login-password-toggle ${isDarkMode ? 'dark' : ''}`}
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
                  className={`login-checkbox ${isDarkMode ? 'dark' : ''}`}
                  type="checkbox"
                />
                <span className={`login-remember-text ${isDarkMode ? 'dark' : ''}`}>
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
                <p className={`login-register-text ${isDarkMode ? 'dark' : ''}`}>
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
              <span className="material-symbols-outlined login-icon" style={{ fontSize: '0.75rem' }}>verified_user</span>
              <span className={`login-security-badge-text ${isDarkMode ? 'dark' : ''}`}>
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

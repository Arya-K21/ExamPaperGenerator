import { useState } from 'react';
import './LoginScreen.css';

export default function LoginScreen({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid institutional email address.');
      return;
    }
    setLoading(true);
    // Prototype: simulate auth delay, accept any valid-format credentials
    await new Promise(r => setTimeout(r, 900));
    const teacher = {
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      institution: email.split('@')[1]?.split('.')[0]?.replace(/\b\w/g, c => c.toUpperCase()) || 'Institution',
      plan: 'institute',
    };
    localStorage.setItem('examforge_teacher', JSON.stringify(teacher));
    setLoading(false);
    onLogin(teacher);
  };

  return (
    <div className="login-screen">
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />

      {/* Left brand panel */}
      <div className="login-brand">
        <div className="login-brand-inner">
          <div className="login-logo">
            <div className="login-logo-icon">✦</div>
            <span>ExamForge</span>
          </div>
          <h1 className="login-brand-headline">
            The AI Exam Platform<br />
            <span className="gradient-text">Built for Educators</span>
          </h1>
          <p className="login-brand-sub">
            Generate Bloom's-aligned exam papers in seconds. Trusted by institutions across India.
          </p>
          <div className="login-testimonials">
            {[
              { quote: 'Reduced paper-setting time by 80%.', name: 'Dr. Meera S.', role: 'HOD, CS Dept' },
              { quote: 'Set A/B/C generation is a game changer.', name: 'Prof. Arjun K.', role: 'Exam Controller' },
            ].map(t => (
              <div key={t.name} className="login-testimonial glass-card">
                <p className="lt-quote">"{t.quote}"</p>
                <div className="lt-author">
                  <div className="lt-avatar">{t.name[0]}</div>
                  <div>
                    <div className="lt-name">{t.name}</div>
                    <div className="lt-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <div className="login-teacher-badge">
              <span>🎓</span> Teacher Portal
            </div>
            <h2>Welcome back</h2>
            <p>Sign in with your institutional credentials</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="lf-group">
              <label>Institutional Email</label>
              <div className="lf-input-wrap">
                <span className="lf-icon">✉</span>
                <input
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="lf-group">
              <div className="lf-label-row">
                <label>Password</label>
                <button type="button" className="lf-forgot" onClick={() => {}}>
                  Forgot password?
                </button>
              </div>
              <div className="lf-input-wrap">
                <span className="lf-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lf-eye"
                  onClick={() => setShowPassword(p => !p)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <div className="lf-error">{error}</div>}

            <button
              type="submit"
              className={`btn-primary lf-submit ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? <span className="lf-spinner" /> : 'Sign In →'}
            </button>
          </form>

          <div className="lf-divider"><span>New to ExamForge?</span></div>

          <button className="btn-secondary lf-register-btn" onClick={onGoRegister}>
            Request Access for Your Institution
          </button>

          <p className="lf-note">
            Access is granted by your institution's administrator.<br />
            Contact your HOD or exam controller if you need credentials.
          </p>
        </div>
      </div>
    </div>
  );
}

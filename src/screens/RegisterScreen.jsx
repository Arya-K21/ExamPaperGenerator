import { useState } from 'react';
import './LoginScreen.css';

export default function RegisterScreen({ onGoLogin }) {
  const [form, setForm] = useState({ name: '', institution: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.institution || !form.email || !form.password || !form.confirm) {
      setError('All fields are required.'); return;
    }
    if (!form.email.includes('@')) {
      setError('Please use your institutional email address.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.'); return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="login-screen">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-brand">
          <div className="login-brand-inner">
            <div className="login-logo">
              <div className="login-logo-icon">✦</div>
              <span>ExamForge</span>
            </div>
            <h1 className="login-brand-headline">Institution <span className="gradient-text">Onboarding</span></h1>
            <p className="login-brand-sub">Your request has been received. Our team will review and provision your account within 24 hours.</p>
          </div>
        </div>
        <div className="login-form-panel">
          <div className="login-form-wrap" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 24 }}>✅</div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Request Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.7 }}>
              We&apos;ve received your access request for <strong>{form.institution}</strong>.<br />
              Our team will reach out to <strong>{form.email}</strong> within 24 hours.
            </p>
            <button className="btn-primary" onClick={onGoLogin} style={{ width: '100%', padding: 15 }}>
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />

      <div className="login-brand">
        <div className="login-brand-inner">
          <div className="login-logo">
            <div className="login-logo-icon">✦</div>
            <span>ExamForge</span>
          </div>
          <h1 className="login-brand-headline">
            Join thousands of<br />
            <span className="gradient-text">educators already using</span><br />
            ExamForge
          </h1>
          <p className="login-brand-sub">
            Access is provisioned at the institution level. Fill in your details and our team will onboard your college or university within 24 hours.
          </p>
          <div className="login-testimonials">
            <div className="login-testimonial glass-card">
              <p className="lt-quote">"Onboarding took less than a day. Every faculty member in our department was set up by the next morning."</p>
              <div className="lt-author">
                <div className="lt-avatar">P</div>
                <div>
                  <div className="lt-name">Prof. Priya T.</div>
                  <div className="lt-role">Exam Controller, Pune University</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <div className="login-teacher-badge"><span>🏛️</span> Institution Access Request</div>
            <h2>Request Access</h2>
            <p>We&apos;ll provision your institution&apos;s account within 24 hours</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="lf-group">
              <label>Full Name</label>
              <div className="lf-input-wrap">
                <span className="lf-icon">👤</span>
                <input type="text" placeholder="Dr. / Prof. Your Name" value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
            </div>

            <div className="lf-group">
              <label>Institution Name</label>
              <div className="lf-input-wrap">
                <span className="lf-icon">🏛️</span>
                <input type="text" placeholder="e.g. IIT Bombay, VIT University" value={form.institution} onChange={e => update('institution', e.target.value)} />
              </div>
            </div>

            <div className="lf-group">
              <label>Institutional Email</label>
              <div className="lf-input-wrap">
                <span className="lf-icon">✉</span>
                <input type="email" placeholder="you@university.edu" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="lf-group">
                <label>Password</label>
                <div className="lf-input-wrap">
                  <span className="lf-icon">🔒</span>
                  <input type="password" placeholder="••••••" value={form.password} onChange={e => update('password', e.target.value)} />
                </div>
              </div>
              <div className="lf-group">
                <label>Confirm Password</label>
                <div className="lf-input-wrap">
                  <span className="lf-icon">🔒</span>
                  <input type="password" placeholder="••••••" value={form.confirm} onChange={e => update('confirm', e.target.value)} />
                </div>
              </div>
            </div>

            {error && <div className="lf-error">{error}</div>}

            <button type="submit" className={`btn-primary lf-submit ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? <span className="lf-spinner" /> : 'Submit Request →'}
            </button>
          </form>

          <div className="lf-divider"><span>Already have access?</span></div>
          <button className="btn-secondary lf-register-btn" onClick={onGoLogin}>Back to Sign In</button>
        </div>
      </div>
    </div>
  );
}

import './Landing.css';

export default function Landing({ onStart }) {
  return (
    <div className="landing">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <nav className="landing-nav">
        <div className="nav-logo">
          <div className="logo-icon">✦</div>
          <span>ExamForge</span>
        </div>
        <div className="nav-badge">
          <span className="chip chip-blue">Powered by GenAI</span>
        </div>
      </nav>

      <main className="landing-main">
        <div className="landing-content animate-fade-up">
          <div className="hero-tag chip chip-purple">
            🎓 Capgemini Hackathon 2026 — Education & Learning
          </div>

          <h1 className="hero-title">
            Smarter Exam Papers,<br />
            <span className="gradient-text">Built in Seconds</span>
          </h1>

          <p className="hero-subtitle">
            Upload your syllabus, define your Bloom's taxonomy mix, and let our
            AI agent craft a perfectly balanced question paper — complete with
            answer keys and a full audit report.
          </p>

          <div className="hero-actions">
            <button className="btn-primary hero-cta" onClick={onStart}>
              Generate a Paper →
            </button>
            <button className="btn-secondary">Watch Demo</button>
          </div>

          <div className="hero-stats stagger">
            {[
              { value: '6', label: "Bloom's Levels", icon: '🧠' },
              { value: '~12s', label: 'Generation Time', icon: '⚡' },
              { value: '100%', label: 'Coverage Audit', icon: '✅' },
              { value: 'PDF + DOCX', label: 'Export Formats', icon: '📄' },
            ].map((s) => (
              <div key={s.label} className="stat-card glass-card animate-fade-up">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-visual animate-fade">
          <div className="visual-card glass-card float-card">
            <div className="vc-header">
              <div className="vc-dot green" />
              <div className="vc-dot yellow" />
              <div className="vc-dot red" />
              <span>Audit Report</span>
            </div>
            <div className="vc-rows">
              {[
                { label: 'Syllabus Coverage', val: '9/10 topics', ok: true },
                { label: "Bloom's Distribution", val: 'Matched', ok: true },
                { label: 'Originality Check', val: 'All passed', ok: true },
                { label: 'Answer Key', val: '20/20 ready', ok: true },
                { label: 'Estimated Difficulty', val: 'Medium-Hard', ok: null },
              ].map((r) => (
                <div key={r.label} className="vc-row">
                  <span className="vc-label">{r.label}</span>
                  <span className={`vc-val ${r.ok === true ? 'ok' : r.ok === false ? 'warn' : 'neutral'}`}>
                    {r.ok === true ? '✅' : r.ok === false ? '⚠️' : '📊'} {r.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

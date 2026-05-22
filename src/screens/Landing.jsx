import './Landing.css';

const PRICING = [
  {
    id: 'department',
    name: 'Department',
    target: 'Small college / single dept.',
    price: '₹4,999',
    period: '/mo',
    color: '#4f8ef7',
    colorRaw: '79, 142, 247',
    features: ['Up to 10 teachers', '3 subjects', 'Exam paper generation', 'Bloom\'s taxonomy', 'PDF + DOCX export'],
    cta: 'Request Demo',
  },
  {
    id: 'institute',
    name: 'Institute',
    target: 'Mid-size college',
    price: '₹12,999',
    period: '/mo',
    color: '#10b981',
    colorRaw: '16, 185, 129',
    features: ['Up to 50 teachers', 'Unlimited subjects', 'Set A / B / C generation', 'Backlog paper generation', 'Question bank management', 'Anti-repetition AI'],
    cta: 'Request Demo',
    popular: true,
  },
  {
    id: 'university',
    name: 'University',
    target: 'Full university',
    price: '₹29,999',
    period: '/mo',
    color: '#a78bfa',
    colorRaw: '124, 58, 237',
    features: ['Unlimited teachers', 'Campus-wide access', 'LMS integration', 'Analytics dashboard', 'Admin console', 'Priority support'],
    cta: 'Contact Sales',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    target: 'Multi-campus / chain',
    price: 'Custom',
    period: '',
    color: '#f59e0b',
    colorRaw: '245, 158, 11',
    features: ['White-label branding', 'Dedicated success manager', 'SLA guarantee', 'API access', 'Custom integrations', 'On-premise option'],
    cta: 'Contact Sales',
  },
];

const FEATURES = [
  { icon: '🧠', title: "Bloom's Taxonomy", desc: '6 cognitive levels, fully configurable' },
  { icon: '🎛️', title: 'Adaptive Variants', desc: 'Scaffolded, Standard & Advanced per question' },
  { icon: '📑', title: 'Set A / B / C', desc: 'Multiple paper sets generated automatically' },
  { icon: '🕒', title: 'Backlog Generation', desc: 'Generate from previous semester papers' },
  { icon: '🗄️', title: 'Question Bank', desc: 'Build and reuse a curated question library' },
  { icon: '✅', title: 'Full Audit Report', desc: 'Coverage, difficulty & originality checks' },
];

export default function Landing({ onStart, teacher, onSignOut }) {
  return (
    <div className="landing">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Nav */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <div className="logo-icon">✦</div>
          <span>ExamForge</span>
        </div>
        <div className="nav-right">
          <span className="chip chip-blue">Powered by Gemini AI</span>
          {teacher && (
            <div className="nav-teacher-pill">
              <div className="nav-avatar">{teacher.name?.[0]}</div>
              <span>{teacher.name?.split(' ')[0]}</span>
              <button className="nav-signout" onClick={onSignOut}>Sign out</button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-content animate-fade-up">
          <div className="hero-tag chip chip-purple">
            🎓 Capgemini Hackathon 2026 — Education &amp; Learning
          </div>

          <h1 className="hero-title">
            Smarter Exam Papers,<br />
            <span className="gradient-text">Built in Seconds</span>
          </h1>

          <p className="hero-subtitle">
            Upload your syllabus, define your Bloom&apos;s taxonomy mix, and let our
            AI agent craft a perfectly balanced question paper — complete with
            adaptive variants, answer keys and a full audit report.
          </p>

          {/* Feature pills grid */}
          <div className="hero-features stagger">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-pill glass-card animate-fade-up">
                <span className="feature-pill-icon">{f.icon}</span>
                <div className="feature-pill-text">
                  <span className="feature-pill-title">{f.title}</span>
                  <span className="feature-pill-desc">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right visual */}
        <div className="landing-visual animate-fade">
          <div className="visual-card glass-card float-card">
            <div className="vc-header">
              <div className="vc-dot green" /><div className="vc-dot yellow" /><div className="vc-dot red" />
              <span>Live Audit Report</span>
            </div>
            <div className="vc-rows">
              {[
                { label: 'Syllabus Coverage',      val: '9/10 topics',  ok: true  },
                { label: "Bloom's Distribution",   val: 'Matched',      ok: true  },
                { label: 'Originality Check',       val: 'All passed',   ok: true  },
                { label: 'Answer Key',              val: '20/20 ready',  ok: true  },
                { label: 'Estimated Difficulty',    val: 'Medium-Hard',  ok: null  },
              ].map(r => (
                <div key={r.label} className="vc-row">
                  <span className="vc-label">{r.label}</span>
                  <span className={`vc-val ${r.ok === true ? 'ok' : r.ok === false ? 'warn' : 'neutral'}`}>
                    {r.ok === true ? '✅' : r.ok === false ? '⚠️' : '📊'} {r.val}
                  </span>
                </div>
              ))}
            </div>
            <div className="vc-variants">
              <span className="vc-variant-label">Adaptive Variants</span>
              <div className="vc-variant-chips">
                <span className="vc-chip scaffolded">🪜 Scaffolded</span>
                <span className="vc-chip standard">📋 Standard</span>
                <span className="vc-chip advanced">🚀 Advanced</span>
              </div>
            </div>
          </div>

          <div className="hero-stats stagger">
            {[
              { value: '6',    label: "Bloom's Levels",    icon: '🧠' },
              { value: '~20s', label: 'Generation Time',   icon: '⚡' },
              { value: '3×',   label: 'Paper Variants',    icon: '🎛️' },
              { value: 'A/B/C',label: 'Multiple Sets',     icon: '📑' },
            ].map(s => (
              <div key={s.label} className="stat-card glass-card animate-fade-up">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mode Selector ───────────────────────────────────────────────── */}
      <section className="mode-section animate-fade-up">
        <div className="mode-section-header">
          <h2>What would you like to do?</h2>
          <p>Choose a mode to get started</p>
        </div>
        <div className="mode-cards">
          <div className="mode-card glass-card" onClick={() => onStart('paper')}>
            <div className="mode-card-icon" style={{ background: 'rgba(79,142,247,0.12)', color: '#4f8ef7' }}>📝</div>
            <div className="mode-card-body">
              <h3>Exam Paper Generator</h3>
              <p>Generate a full, balanced question paper with Bloom&apos;s taxonomy distribution, audit report, and multi-format export.</p>
              <ul className="mode-card-list">
                <li>✓ Bloom&apos;s taxonomy mapping</li>
                <li>✓ Set A / B / C generation</li>
                <li>✓ Backlog paper support</li>
                <li>✓ PDF + DOCX export with answer key</li>
              </ul>
            </div>
            <button className="btn-primary mode-card-btn">Create Exam Paper →</button>
          </div>

          <div className="mode-card glass-card" onClick={() => onStart('bank')}>
            <div className="mode-card-icon" style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa' }}>🗄️</div>
            <div className="mode-card-body">
              <h3>Question Bank</h3>
              <p>Build, organise, and manage a reusable library of questions. Save from any generation and reuse across papers.</p>
              <ul className="mode-card-list">
                <li>✓ Filter by subject, level, difficulty</li>
                <li>✓ Save questions from any generation</li>
                <li>✓ Add questions directly to a new paper</li>
                <li>✓ Full edit and delete controls</li>
              </ul>
            </div>
            <button className="btn-primary mode-card-btn" style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
              Manage Question Bank →
            </button>
          </div>
        </div>
      </section>

      {/* ── Pricing / Licensing ─────────────────────────────────────────── */}
      <section className="pricing-section">
        <div className="pricing-header animate-fade-up">
          <div className="chip chip-orange" style={{ marginBottom: 16, width: 'fit-content', margin: '0 auto 16px' }}>
            💼 Institution Licensing
          </div>
          <h2>Licensed for Educational Institutions</h2>
          <p>ExamForge is not a self-serve tool — we partner directly with colleges and universities to deploy campus-wide.</p>
        </div>

        <div className="pricing-cards stagger">
          {PRICING.map(plan => (
            <div
              key={plan.id}
              className={`pricing-card glass-card animate-fade-up ${plan.popular ? 'popular' : ''}`}
              style={plan.popular ? { borderColor: `rgba(${plan.colorRaw}, 0.5)` } : {}}
            >
              {plan.popular && (
                <div className="pricing-popular-badge" style={{ background: `rgba(${plan.colorRaw}, 0.15)`, color: plan.color }}>
                  Most Popular
                </div>
              )}
              <div className="pricing-plan-name" style={{ color: plan.color }}>{plan.name}</div>
              <div className="pricing-target">{plan.target}</div>
              <div className="pricing-price">
                <span className="pricing-amount">{plan.price}</span>
                <span className="pricing-period">{plan.period}</span>
              </div>
              <ul className="pricing-features">
                {plan.features.map(f => (
                  <li key={f}>
                    <span className="pf-check" style={{ color: plan.color }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={plan.popular ? 'btn-primary pricing-cta' : 'btn-secondary pricing-cta'}
                style={plan.popular ? { background: `linear-gradient(135deg, rgba(${plan.colorRaw},0.9), rgba(${plan.colorRaw},0.6))` } : {}}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="pricing-note animate-fade-up">
          All plans include onboarding support, training sessions, and a dedicated institution admin console.<br />
          <strong>Contact us at</strong> sales@examforge.in
        </p>
      </section>
    </div>
  );
}

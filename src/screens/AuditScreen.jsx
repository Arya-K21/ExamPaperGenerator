import { getMockAudit } from '../data/mockData';
import './AuditScreen.css';

const LEVEL_COLORS = {
  Remember: '#4f8ef7',
  Understand: '#a78bfa',
  Apply: '#10b981',
  Analyse: '#f59e0b',
  Evaluate: '#f472b6',
  Create: '#ef4444',
};

export default function AuditScreen({ onProceed, audit: auditProp, syllabus }) {
  const audit = auditProp || getMockAudit('dsa');

  return (
    <div className="audit-screen">
      <div className="orb orb-1" /><div className="orb orb-2" />

      <div className="audit-header animate-fade-up">
        <div className="audit-badge chip chip-green">✅ Generation Complete</div>
        <h1>Paper <span className="gradient-text">Audit Report</span></h1>
        <p>Review how well the paper meets your requirements before examining questions</p>
      </div>

      <div className="audit-body">
        {/* Top metric cards */}
        <div className="audit-metrics stagger">
          <MetricCard
            icon="📚" label="Syllabus Coverage"
            value={`${audit.topicsCovered}/${audit.topicsTotal}`}
            sub="topics covered"
            status={audit.topicsCovered === audit.topicsTotal ? 'ok' : 'warn'}
          />
          <MetricCard
            icon="🧠" label="Bloom's Match"
            value={audit.bloomsMatch ? 'Matched' : 'Off'}
            sub="distribution"
            status={audit.bloomsMatch ? 'ok' : 'warn'}
          />
          <MetricCard
            icon="🔍" label="Originality"
            value={`${audit.originality}%`}
            sub="questions passed"
            status="ok"
          />
          <MetricCard
            icon="📊" label="Difficulty"
            value={audit.difficulty}
            sub="estimated level"
            status="neutral"
          />
          <MetricCard
            icon="✍️" label="Total Questions"
            value={audit.totalQuestions}
            sub={`${audit.totalMarks} total marks`}
            status="ok"
          />
        </div>

        {/* Warnings */}
        {audit.missedTopics.length > 0 && (
          <div className="audit-warning glass-card animate-fade-up">
            <div className="warn-header">
              <span className="warn-icon">⚠️</span>
              <div>
                <h3>Coverage Gap Detected</h3>
                <p>The following syllabus topics have no questions assigned:</p>
              </div>
            </div>
            <div className="warn-topics">
              {audit.missedTopics.map(t => (
                <span key={t} className="chip chip-orange">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Bloom's distribution chart */}
        <div className="glass-card audit-section animate-fade-up">
          <h2>Bloom's Taxonomy Distribution</h2>
          <p className="audit-section-sub">Visual breakdown of questions across cognitive levels</p>
          <div className="bloom-bars">
            {audit.distribution.map((d) => (
              <div key={d.level} className="bloom-bar-row">
                <div className="bloom-bar-meta">
                  <span className="bloom-bar-label" style={{ color: LEVEL_COLORS[d.level] || 'var(--accent-primary)' }}>
                    {d.level}
                  </span>
                  <span className="bloom-bar-count">{d.count} Qs · {d.marks} marks</span>
                </div>
                <div className="bloom-bar-track">
                  <div
                    className="bloom-bar-fill"
                    style={{
                      width: `${d.percent}%`,
                      background: LEVEL_COLORS[d.level] || 'var(--accent-primary)',
                    }}
                  />
                </div>
                <span className="bloom-bar-pct">{d.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent summary */}
        <div className="glass-card audit-section agent-note animate-fade-up">
          <div className="agent-icon">✦</div>
          <div>
            <h3>Agent Summary</h3>
            <p>
              Generated <strong>{audit.totalQuestions} questions</strong> across <strong>{audit.distribution.length} Bloom's levels</strong> for <strong>{audit.topicsCovered} topics</strong>.
              One topic ({audit.missedTopics[0]}) had insufficient syllabus content for question generation.
              All questions passed originality checks. Estimated difficulty is <strong>{audit.difficulty}</strong>.
            </p>
          </div>
        </div>

        <div className="audit-actions animate-fade-up">
          <button className="btn-primary audit-cta" onClick={onProceed}>
            Review Questions →
          </button>
          <p className="audit-note">You can reject individual questions in the next step</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, sub, status }) {
  return (
    <div className={`metric-card glass-card animate-fade-up ${status}`}>
      <div className="mc-icon">{icon}</div>
      <div className={`mc-value ${status}`}>{value}</div>
      <div className="mc-label">{label}</div>
      <div className="mc-sub">{sub}</div>
    </div>
  );
}

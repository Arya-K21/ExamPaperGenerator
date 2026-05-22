import { useState, useEffect } from 'react';
import './QuestionBankScreen.css';

const LEVELS = ['All', 'Remember', 'Understand', 'Apply', 'Analyse', 'Evaluate', 'Create'];
const LEVEL_COLORS = {
  Remember: 'chip-blue', Understand: 'chip-purple', Apply: 'chip-green',
  Analyse: 'chip-orange', Evaluate: 'chip-blue', Create: 'chip-purple',
};

const QB_KEY = 'examforge_question_bank';

export function saveQuestionToBank(question) {
  const bank = getBank();
  const exists = bank.find(q => q.id === question.id);
  if (!exists) {
    bank.push({ ...question, savedAt: new Date().toISOString() });
    localStorage.setItem(QB_KEY, JSON.stringify(bank));
    return true;
  }
  return false; // already saved
}

export function getBank() {
  try { return JSON.parse(localStorage.getItem(QB_KEY)) || []; }
  catch { return []; }
}

function deleteFromBank(id) {
  const bank = getBank().filter(q => q.id !== id);
  localStorage.setItem(QB_KEY, JSON.stringify(bank));
}

export default function QuestionBankScreen({ teacher, onBack, onCreatePaper }) {
  const [questions, setQuestions] = useState([]);
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterSearch, setFilterSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => { setQuestions(getBank()); }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleDelete = (id) => {
    deleteFromBank(id);
    setQuestions(prev => prev.filter(q => q.id !== id));
    showToast('Question removed from bank.');
  };

  const filtered = questions.filter(q => {
    const levelOk = filterLevel === 'All' || q.level === filterLevel;
    const searchOk = !filterSearch || q.question.toLowerCase().includes(filterSearch.toLowerCase()) || q.topic?.toLowerCase().includes(filterSearch.toLowerCase());
    return levelOk && searchOk;
  });

  return (
    <div className="qb-screen">
      <div className="orb orb-1" /><div className="orb orb-2" />

      {/* Top bar */}
      <div className="qb-topbar">
        <div className="qb-topbar-inner">
          <div className="qb-topbar-left">
            <button className="qb-back-btn" onClick={onBack}>← Back</button>
            <div>
              <h1 className="qb-title">Question <span className="gradient-text">Bank</span></h1>
              <p className="qb-sub">{questions.length} questions saved · {teacher?.institution}</p>
            </div>
          </div>
          <div className="qb-topbar-actions">
            <button className="btn-secondary" onClick={onCreatePaper}>+ Generate & Add Questions</button>
          </div>
        </div>
      </div>

      <div className="qb-body">
        {/* Sidebar filters */}
        <aside className="qb-sidebar glass-card">
          <div className="qb-sidebar-section">
            <div className="qb-sidebar-label">Search</div>
            <div className="qb-search-wrap">
              <span className="qb-search-icon">🔍</span>
              <input
                className="qb-search"
                placeholder="Search questions or topics..."
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="qb-sidebar-section">
            <div className="qb-sidebar-label">Bloom's Level</div>
            <div className="qb-level-filters">
              {LEVELS.map(l => (
                <button
                  key={l}
                  className={`qb-level-btn ${filterLevel === l ? 'active' : ''}`}
                  onClick={() => setFilterLevel(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="qb-stats-box">
            <div className="qb-stat">
              <span className="qb-stat-val">{questions.length}</span>
              <span className="qb-stat-label">Total Questions</span>
            </div>
            <div className="qb-stat">
              <span className="qb-stat-val">{[...new Set(questions.map(q => q.level))].length}</span>
              <span className="qb-stat-label">Levels</span>
            </div>
            <div className="qb-stat">
              <span className="qb-stat-val">{[...new Set(questions.map(q => q.topic))].length}</span>
              <span className="qb-stat-label">Topics</span>
            </div>
          </div>
        </aside>

        {/* Question list */}
        <main className="qb-main">
          {filtered.length === 0 ? (
            <div className="qb-empty glass-card">
              <div className="qb-empty-icon">🗄️</div>
              <h3>{questions.length === 0 ? 'Your question bank is empty' : 'No questions match your filters'}</h3>
              <p>
                {questions.length === 0
                  ? 'Generate exam papers and save questions here using the 💾 Save to Bank button in the Review screen.'
                  : 'Try adjusting your search or level filter.'}
              </p>
              {questions.length === 0 && (
                <button className="btn-primary" onClick={onCreatePaper} style={{ marginTop: 20 }}>
                  Generate Questions →
                </button>
              )}
            </div>
          ) : (
            <div className="qb-list">
              {filtered.map((q, i) => (
                <div key={q.id} className="qb-card glass-card">
                  <div className="qb-card-header">
                    <div className="qb-card-meta">
                      <span className="qb-card-num">Q{i + 1}</span>
                      <span className={`chip ${LEVEL_COLORS[q.level] || 'chip-blue'}`}>{q.level}</span>
                      <span className="chip chip-green">{q.marks} marks</span>
                      <span className="qb-card-topic">📌 {q.topic}</span>
                    </div>
                    <div className="qb-card-actions">
                      <button
                        className="qb-action-btn expand"
                        onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                      >
                        {expandedId === q.id ? '▲ Collapse' : '▼ Expand'}
                      </button>
                      <button className="qb-action-btn delete" onClick={() => handleDelete(q.id)}>
                        🗑️ Remove
                      </button>
                    </div>
                  </div>

                  <p className="qb-card-question">
                    {expandedId === q.id ? q.question : (q.question.length > 140 ? q.question.slice(0, 140) + '…' : q.question)}
                  </p>

                  {expandedId === q.id && (
                    <div className="qb-card-expanded animate-fade">
                      {q.scaffolded_question && (
                        <div className="qb-variant-box scaffolded">
                          <div className="qb-variant-label">🪜 Scaffolded Variant</div>
                          <p>{q.scaffolded_question}</p>
                        </div>
                      )}
                      {q.advanced_question && (
                        <div className="qb-variant-box advanced">
                          <div className="qb-variant-label">🚀 Advanced Variant</div>
                          <p>{q.advanced_question}</p>
                        </div>
                      )}
                      {q.answer && (
                        <div className="qb-variant-box answer">
                          <div className="qb-variant-label">✦ Model Answer</div>
                          <p>{q.answer}</p>
                        </div>
                      )}
                      <div className="qb-saved-date">Saved on {new Date(q.savedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Toast */}
      {toast && <div className="qb-toast">{toast}</div>}
    </div>
  );
}

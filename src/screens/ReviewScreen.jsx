import { useState } from 'react';
import { getMockQuestions } from '../data/mockData';
import { regenerateQuestion } from '../api/client';
import './ReviewScreen.css';

const LEVEL_COLORS = {
  Remember: 'chip-blue',
  Understand: 'chip-purple',
  Apply: 'chip-green',
  Analyse: 'chip-orange',
  Evaluate: 'chip-blue',
  Create: 'chip-purple',
};

const REJECT_REASONS = ['Too easy', 'Too hard', 'Off topic', 'Too similar to another', 'Rephrase it'];

export default function ReviewScreen({ onApprove, questions: questionsProp, syllabus }) {
  const [questions, setQuestions] = useState(
    () => (questionsProp || getMockQuestions('dsa')).map(q => ({ ...q, rejected: false, rejectionReason: null }))
  );
  const [expandedAnswer, setExpandedAnswer] = useState({});
  const [rejectMenu, setRejectMenu] = useState(null);
  const [regenerating, setRegenerating] = useState({});

  const approved = questions.filter(q => !q.rejected).length;
  const total = questions.length;

  const toggleAnswer = (id) => {
    setExpandedAnswer(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReject = (id, reason) => {
    setRejectMenu(null);
    setRegenerating(prev => ({ ...prev, [id]: true }));

    const q = questions.find(q => q.id === id);

    regenerateQuestion({
      questionId: id,
      questionText: q.question,
      level: q.level,
      topic: q.topic,
      marks: q.marks,
      reason,
      syllabus: syllabus || '',
    })
      .then((data) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...data.question } : q));
      })
      .catch(() => {
        // Fallback: update question text locally
        setQuestions(prev => prev.map(q =>
          q.id === id ? { ...q, rejectionReason: reason, question: getRegeneratedQ(q, reason) } : q
        ));
      })
      .finally(() => {
        setRegenerating(prev => ({ ...prev, [id]: false }));
      });
  };

  const getRegeneratedQ = (q, reason) => {
    const prefixes = {
      'Too easy': `[Advanced] ${q.question.replace('Define', 'Critically examine').replace('State', 'Derive and explain')}`,
      'Too hard': `[Simplified] ${q.question.replace('Analyse', 'Describe').replace('Evaluate', 'Explain')}`,
      'Off topic': `Explain the key concept of ${q.topic} in the context of real-world applications.`,
      'Too similar to another': `Describe an alternative approach to ${q.topic} not covered in other questions.`,
      'Rephrase it': `In your own words, ${q.question.charAt(0).toLowerCase()}${q.question.slice(1)}`,
    };
    return prefixes[reason] || q.question;
  };

  return (
    <div className="review-screen">
      <div className="orb orb-1" /><div className="orb orb-2" />

      {/* Sticky top bar */}
      <div className="review-topbar">
        <div className="review-topbar-inner">
          <div>
            <h1 className="review-title">Review <span className="gradient-text">Questions</span></h1>
            <p className="review-sub">Reject any question to have the agent regenerate it</p>
          </div>
          <div className="review-progress-info">
            <div className="review-progress-bar">
              <div className="review-progress-fill" style={{ width: `${(approved / total) * 100}%` }} />
            </div>
            <span className="review-progress-label">{approved}/{total} approved</span>
          </div>
          <button
            className="btn-primary"
            onClick={() => onApprove(questions.filter(q => !q.rejected))}
          >
            Approve & Download →
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="questions-list">
        {questions.map((q, i) => (
          <div key={q.id} className={`question-card glass-card ${q.rejected ? 'rejected' : ''} ${regenerating[q.id] ? 'regenerating' : ''}`}>
            <div className="qc-header">
              <div className="qc-meta">
                <span className="qc-num">Q{i + 1}</span>
                <span className={`chip ${LEVEL_COLORS[q.level] || 'chip-blue'}`}>{q.level}</span>
                <span className="chip chip-green">{q.marks} marks</span>
                <span className="qc-topic">📌 {q.topic}</span>
              </div>

              {regenerating[q.id] ? (
                <div className="regenerating-badge">
                  <span className="regen-spinner" />
                  <span>Regenerating...</span>
                </div>
              ) : (
                <div className="qc-actions">
                  {q.rejectionReason && (
                    <span className="chip chip-orange">↻ Regenerated: {q.rejectionReason}</span>
                  )}
                  <div className="reject-wrap">
                    <button
                      className="btn-danger"
                      onClick={() => setRejectMenu(rejectMenu === q.id ? null : q.id)}
                    >
                      👎 Reject
                    </button>
                    {rejectMenu === q.id && (
                      <div className="reject-dropdown">
                        <p className="reject-dropdown-label">Why are you rejecting?</p>
                        {REJECT_REASONS.map(r => (
                          <button key={r} className="reject-option" onClick={() => handleReject(q.id, r)}>
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <p className="qc-question">{q.question}</p>

            <button className="answer-toggle" onClick={() => toggleAnswer(q.id)}>
              {expandedAnswer[q.id] ? '▲ Hide Answer Key' : '▼ Show Answer Key'}
            </button>

            {expandedAnswer[q.id] && (
              <div className="answer-box animate-fade">
                <div className="answer-label">✦ Model Answer</div>
                <p className="answer-text">{q.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="review-footer">
        <button className="btn-primary review-approve-btn" onClick={() => onApprove(questions.filter(q => !q.rejected))}>
          ✅ Approve Paper & Download →
        </button>
      </div>
    </div>
  );
}

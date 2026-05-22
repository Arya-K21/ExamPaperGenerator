import { useState } from 'react';
import { getMockQuestions } from '../data/mockData';
import { regenerateQuestion } from '../api/client';
import { saveQuestionToBank } from './QuestionBankScreen';
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
  const [activeVariants, setActiveVariants] = useState({});
  const [savedToBank, setSavedToBank] = useState({});
  
  // Edit & Add state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const approved = questions.filter(q => !q.rejected).length;
  const total = questions.length;

  const toggleAnswer = (id) => {
    // Don't toggle if currently editing this question
    if (editingId === id) return;
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

  const handleEdit = (q) => {
    setEditingId(q.id);
    setEditForm({
      ...q,
      scaffolded_question: q.scaffolded_question || '',
      advanced_question: q.advanced_question || '',
    });
    setExpandedAnswer(prev => ({ ...prev, [q.id]: true })); // Expand answer for editing
  };

  const handleSaveEdit = () => {
    setQuestions(prev => prev.map(q => q.id === editingId ? editForm : q));
    setEditingId(null);
    setEditForm(null);
  };

  const handleCancelEdit = () => {
    // If it was a newly added blank question, remove it on cancel
    if (editForm && editForm.question.trim() === '') {
      setQuestions(prev => prev.filter(q => q.id !== editingId));
    }
    setEditingId(null);
    setEditForm(null);
  };

  const handleAddQuestion = () => {
    const newId = 'manual_' + Date.now();
    const newQ = {
      id: newId,
      level: 'Remember',
      marks: 2,
      topic: 'Custom Topic',
      question: '',
      scaffolded_question: '',
      advanced_question: '',
      answer: '',
      rejected: false,
      rejectionReason: null
    };
    setQuestions(prev => [...prev, newQ]);
    setEditingId(newId);
    setEditForm(newQ);
    setExpandedAnswer(prev => ({ ...prev, [newId]: true }));
  };

  const handleApproveClick = () => {
    const approvedList = questions
      .filter(q => !q.rejected)
      .map(q => ({
        ...q,
        selectedVariant: activeVariants[q.id] || 'standard'
      }));
    onApprove(approvedList);
  };

  return (
    <div className="review-screen">
      <div className="orb orb-1" /><div className="orb orb-2" />

      {/* Sticky top bar */}
      <div className="review-topbar">
        <div className="review-topbar-inner">
          <div>
            <h1 className="review-title">Review <span className="gradient-text">Questions</span></h1>
            <p className="review-sub">Select variant options and reject any question to regenerate</p>
          </div>
          <div className="review-progress-info">
            <div className="review-progress-bar">
              <div className="review-progress-fill" style={{ width: `${(approved / total) * 100}%` }} />
            </div>
            <span className="review-progress-label">{approved}/{total} approved</span>
          </div>
          <button
            className="btn-primary"
            onClick={handleApproveClick}
          >
            Approve & Download →
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="questions-list">
        {questions.map((q, i) => {
          const currentVariant = activeVariants[q.id] || 'standard';
          
          let displayedQuestion = q.question;
          if (currentVariant === 'scaffolded') {
            displayedQuestion = q.scaffolded_question || q.question;
          } else if (currentVariant === 'advanced') {
            displayedQuestion = q.advanced_question || q.question;
          }

          return (
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
                    <button className="btn-secondary" onClick={() => handleEdit(q)}>
                      ✏️ Edit
                    </button>
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

              {editingId === q.id ? (
                <div className="qc-edit-form">
                  <div className="edit-row">
                    <select 
                      value={editForm.level} 
                      onChange={e => setEditForm({...editForm, level: e.target.value})}
                      className="edit-select"
                    >
                      {Object.keys(LEVEL_COLORS).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <input 
                      type="number" 
                      value={editForm.marks} 
                      onChange={e => setEditForm({...editForm, marks: parseInt(e.target.value) || 0})}
                      className="edit-input marks-input"
                      min="1"
                    />
                    <input 
                      type="text" 
                      value={editForm.topic} 
                      onChange={e => setEditForm({...editForm, topic: e.target.value})}
                      className="edit-input topic-input"
                      placeholder="Topic..."
                    />
                  </div>
                  <div className="edit-textarea-group">
                    <label>Standard Question Text</label>
                    <textarea 
                      value={editForm.question} 
                      onChange={e => setEditForm({...editForm, question: e.target.value})}
                      className="edit-textarea"
                      placeholder="Standard question text..."
                      rows={2}
                    />
                  </div>
                  <div className="edit-textarea-group">
                    <label>Scaffolded Question Text (for guided learning)</label>
                    <textarea 
                      value={editForm.scaffolded_question} 
                      onChange={e => setEditForm({...editForm, scaffolded_question: e.target.value})}
                      className="edit-textarea"
                      placeholder="Scaffolded question text..."
                      rows={2}
                    />
                  </div>
                  <div className="edit-textarea-group">
                    <label>Advanced Question Text (higher rigor)</label>
                    <textarea 
                      value={editForm.advanced_question} 
                      onChange={e => setEditForm({...editForm, advanced_question: e.target.value})}
                      className="edit-textarea"
                      placeholder="Advanced question text..."
                      rows={2}
                    />
                  </div>
                  <div className="edit-textarea-group">
                    <label>Model Answer</label>
                    <textarea 
                      value={editForm.answer} 
                      onChange={e => setEditForm({...editForm, answer: e.target.value})}
                      className="edit-textarea"
                      placeholder="Model answer..."
                      rows={3}
                    />
                  </div>
                  <div className="edit-actions">
                    <button className="btn-primary" onClick={handleSaveEdit}>Save Changes</button>
                    <button className="btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="variant-tab-container">
                    <button 
                      className={`variant-tab-btn ${currentVariant === 'standard' ? 'active' : ''}`}
                      onClick={() => setActiveVariants(prev => ({ ...prev, [q.id]: 'standard' }))}
                    >
                      📋 Standard
                    </button>
                    <button 
                      className={`variant-tab-btn ${currentVariant === 'scaffolded' ? 'active' : ''}`}
                      onClick={() => setActiveVariants(prev => ({ ...prev, [q.id]: 'scaffolded' }))}
                    >
                      🪜 Scaffolded
                    </button>
                    <button 
                      className={`variant-tab-btn ${currentVariant === 'advanced' ? 'active' : ''}`}
                      onClick={() => setActiveVariants(prev => ({ ...prev, [q.id]: 'advanced' }))}
                    >
                      🚀 Advanced
                    </button>
                  </div>

                  <p className="qc-question">{displayedQuestion}</p>

                  <div className="qc-bottom-row">
                    <button className="answer-toggle" onClick={() => toggleAnswer(q.id)}>
                      {expandedAnswer[q.id] ? '▲ Hide Answer Key' : '▼ Show Answer Key'}
                    </button>
                    <button
                      className={`save-bank-btn ${savedToBank[q.id] ? 'saved' : ''}`}
                      onClick={() => {
                        const ok = saveQuestionToBank(q);
                        setSavedToBank(prev => ({ ...prev, [q.id]: true }));
                        if (!ok) { /* already saved */ }
                      }}
                      disabled={savedToBank[q.id]}
                    >
                      {savedToBank[q.id] ? '✓ Saved to Bank' : '💾 Save to Bank'}
                    </button>
                  </div>

                  {expandedAnswer[q.id] && (
                    <div className="answer-box animate-fade">
                      <div className="answer-label">✦ Model Answer</div>
                      <p className="answer-text">{q.answer}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="add-question-wrap">
        <button className="btn-secondary add-q-btn" onClick={handleAddQuestion}>
          + Add Custom Question
        </button>
      </div>

      <div className="review-footer">
        <button className="btn-primary review-approve-btn" onClick={handleApproveClick}>
          ✅ Approve Paper & Download →
        </button>
      </div>
    </div>
  );
}

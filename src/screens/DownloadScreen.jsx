import { useState } from 'react';
import './DownloadScreen.css';

const VARIANTS = [
  {
    id: 'custom',
    icon: '🎛️',
    title: 'My Custom Mix',
    desc: 'Uses the specific variant you selected per question during the review step',
    color: 'var(--accent-primary)',
    colorRaw: '79, 142, 247',
    tag: 'Personalised',
  },
  {
    id: 'standard',
    icon: '📋',
    title: 'Standard Paper',
    desc: 'All questions at their default classroom difficulty — balanced for the whole class',
    color: 'var(--accent-green)',
    colorRaw: '16, 185, 129',
    tag: 'Default',
  },
  {
    id: 'scaffolded',
    icon: '🪜',
    title: 'Scaffolded Paper',
    desc: 'Questions broken into guided sub-steps (a, b, c) for students who need more structure',
    color: '#f59e0b',
    colorRaw: '245, 158, 11',
    tag: 'Guided Support',
  },
  {
    id: 'advanced',
    icon: '🚀',
    title: 'Advanced Paper',
    desc: 'Open-ended, complex critical-thinking variants — designed for high-performing students',
    color: '#a78bfa',
    colorRaw: '124, 58, 237',
    tag: 'Higher Rigor',
  },
];

function deterministicShuffle(arr, seed) {
  const newArr = [...arr];
  let m = newArr.length;
  let t, i;
  let currentSeed = seed;

  const rand = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  while (m) {
    i = Math.floor(rand() * m--);
    t = newArr[m];
    newArr[m] = newArr[i];
    newArr[i] = t;
  }
  return newArr;
}

export default function DownloadScreen({ questions, config, onRestart }) {
  const [downloadFormat, setDownloadFormat] = useState('custom');
  const [activeSet, setActiveSet] = useState('A');
  const totalMarks = questions.reduce((a, q) => a + q.marks, 0);

  // Compute shuffled questions list based on activeSet
  const getShuffledQuestions = () => {
    if (activeSet === 'B') {
      return deterministicShuffle(questions, 12345);
    } else if (activeSet === 'C') {
      return deterministicShuffle(questions, 67890);
    }
    return questions;
  };

  const shuffledQuestions = getShuffledQuestions();

  const handleDownload = () => {
    const content = generatePaperText(shuffledQuestions, downloadFormat, activeSet);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const variant = VARIANTS.find(v => v.id === downloadFormat);
    const label = variant ? variant.title.replace(/\s+/g, '_') : 'Paper';
    const setLabel = config?.sets > 1 ? `_Set_${activeSet}` : '';
    a.download = `ExamPaper_${label}${setLabel}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeVariant = VARIANTS.find(v => v.id === downloadFormat);

  return (
    <div className="download-screen">
      <div className="orb orb-1" /><div className="orb orb-2" />

      <div className="download-content animate-fade-up">
        {/* Success */}
        <div className="success-icon">
          <div className="success-ring" />
          <div className="success-check">✓</div>
        </div>

        <h1>Your Exam Paper is <span className="gradient-text">Ready!</span></h1>
        <p className="download-sub">
          {questions.length} questions · {totalMarks} total marks · Answer key included
        </p>

        {/* Multiple Sets Tabs Row */}
        {config?.sets > 1 && (
          <div className="set-tabs-container glass-card animate-fade-up">
            <div className="set-tabs-header">
              <span className="set-tabs-icon">📑</span>
              <div className="set-tabs-info">
                <h3>Select Exam Paper Set</h3>
                <p className="set-tabs-desc">Multiple sets generated using deterministic stable shuffling for exam integrity</p>
              </div>
            </div>
            <div className="set-tabs">
              {['A', 'B', 'C'].slice(0, config.sets).map(set => (
                <button
                  key={set}
                  className={`set-tab-btn ${activeSet === set ? 'active' : ''}`}
                  onClick={() => setActiveSet(set)}
                >
                  📄 Set {set}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Inclusivity Variant Selector */}
        <div className="download-variant-selector glass-card animate-fade-up">
          <div className="dvs-header">
            <div>
              <h3>Adaptive Inclusivity Variants</h3>
              <p className="dvs-sub">Choose which version of the paper to download</p>
            </div>
            {activeVariant && (
              <span
                className="dvs-active-tag"
                style={{
                  background: `rgba(${activeVariant.colorRaw}, 0.12)`,
                  color: activeVariant.color,
                  border: `1px solid rgba(${activeVariant.colorRaw}, 0.3)`,
                }}
              >
                {activeVariant.tag}
              </span>
            )}
          </div>

          <div className="dvs-grid">
            {VARIANTS.map(v => (
              <div
                key={v.id}
                className={`dvs-option ${downloadFormat === v.id ? 'active' : ''}`}
                style={downloadFormat === v.id ? {
                  '--variant-color': v.color,
                  '--variant-color-raw': v.colorRaw,
                } : {}}
                onClick={() => setDownloadFormat(v.id)}
              >
                <div
                  className="dvs-accent-bar"
                  style={{ background: v.color }}
                />
                <div
                  className="dvs-icon-wrap"
                  style={downloadFormat === v.id
                    ? { background: `rgba(${v.colorRaw}, 0.15)`, color: v.color }
                    : {}
                  }
                >
                  {v.icon}
                </div>
                <div className="dvs-info">
                  <span className="dvs-title">{v.title}</span>
                  <span className="dvs-desc">{v.desc}</span>
                </div>
                <div
                  className="dvs-radio"
                  style={downloadFormat === v.id ? { borderColor: v.color } : {}}
                >
                  {downloadFormat === v.id && (
                    <div
                      className="dvs-radio-dot"
                      style={{ background: v.color }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download cards */}
        <div className="download-cards">
          <div className="download-card glass-card" onClick={handleDownload}>
            <div className="dc-icon">📄</div>
            <div className="dc-label">Download PDF</div>
            <div className="dc-sub">Print-ready format</div>
            <button className="btn-primary dc-btn">Download PDF</button>
          </div>

          <div className="download-card glass-card" onClick={handleDownload}>
            <div className="dc-icon">📝</div>
            <div className="dc-label">Download DOCX</div>
            <div className="dc-sub">Editable Word format</div>
            <button className="btn-secondary dc-btn" style={{ width: '100%' }}>Download DOCX</button>
          </div>
        </div>

        {/* Paper summary & preview */}
        <div className="paper-summary glass-card animate-fade-up">
          <h3>Paper Summary & Question Order</h3>
          <div className="summary-grid">
            {[
              { label: 'Total Questions', val: questions.length },
              { label: 'Total Marks', val: totalMarks },
              { label: "Bloom's Levels", val: [...new Set(questions.map(q => q.level))].length },
              { label: 'Topics Covered', val: [...new Set(questions.map(q => q.topic))].length },
            ].map(s => (
              <div key={s.label} className="summary-grid-item">
                <div className="sgi-val">{s.val}</div>
                <div className="sgi-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="paper-questions-preview">
            <h4>Question Sequence Preview (Set {activeSet})</h4>
            <div className="q-preview-list">
              {shuffledQuestions.map((q, idx) => {
                let qText = q.question;
                if (downloadFormat === 'custom') {
                  const v = q.selectedVariant || 'standard';
                  if (v === 'scaffolded') qText = q.scaffolded_question || q.question;
                  else if (v === 'advanced') qText = q.advanced_question || q.question;
                } else if (downloadFormat === 'scaffolded') {
                  qText = q.scaffolded_question || q.question;
                } else if (downloadFormat === 'advanced') {
                  qText = q.advanced_question || q.question;
                }

                const truncated = qText.length > 75 ? qText.substring(0, 75) + '...' : qText;

                return (
                  <div key={q.id || idx} className="q-preview-item">
                    <span className="q-preview-num">Q{idx + 1}</span>
                    <div className="q-preview-details">
                      <p className="q-preview-text">{truncated}</p>
                      <div className="q-preview-badge-row">
                        <span className="q-preview-badge level-badge">{q.level}</span>
                        <span className="q-preview-badge marks-badge">{q.marks} marks</span>
                        <span className="q-preview-badge topic-badge">{q.topic}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Included docs */}
        <div className="included-docs glass-card animate-fade-up">
          <h3>What's Included</h3>
          <div className="docs-list">
            {[
              { icon: '📋', label: 'Question Paper', desc: `Formatted Exam Paper (Set ${activeSet})` },
              { icon: '🔑', label: 'Answer Key', desc: `Matching Model Answer Key (Set ${activeSet})` },
              { icon: '📊', label: 'Audit Report', desc: "Coverage & Bloom's distribution proof" },
            ].map(d => (
              <div key={d.label} className="doc-item">
                <span className="doc-icon">{d.icon}</span>
                <div>
                  <div className="doc-label">{d.label}</div>
                  <div className="doc-desc">{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-secondary restart-btn" onClick={onRestart}>
          ↩ Generate Another Paper
        </button>
      </div>
    </div>
  );
}

function generatePaperText(questions, downloadFormat, activeSet = 'A') {
  const variant = {
    custom: 'CUSTOM MIX',
    standard: 'STANDARD VERSION',
    scaffolded: 'SCAFFOLDED VERSION',
    advanced: 'ADVANCED VERSION',
  }[downloadFormat] || 'STANDARD VERSION';

  let out = `=== EXAM PAPER (${variant} - SET ${activeSet}) ===\n\n`;

  questions.forEach((q, i) => {
    let questionText = q.question;
    if (downloadFormat === 'custom') {
      const v = q.selectedVariant || 'standard';
      if (v === 'scaffolded') questionText = q.scaffolded_question || q.question;
      else if (v === 'advanced') questionText = q.advanced_question || q.question;
    } else if (downloadFormat === 'scaffolded') {
      questionText = q.scaffolded_question || q.question;
    } else if (downloadFormat === 'advanced') {
      questionText = q.advanced_question || q.question;
    }

    out += `Q${i + 1}. [${q.level} | ${q.marks} marks]\n${questionText}\n\n`;
  });

  out += `\n=== ANSWER KEY (SET ${activeSet}) ===\n\n`;
  questions.forEach((q, i) => {
    out += `Q${i + 1}. ${q.answer}\n\n`;
  });
  return out;
}

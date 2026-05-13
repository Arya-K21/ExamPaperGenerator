import './DownloadScreen.css';

export default function DownloadScreen({ questions, onRestart }) {
  const totalMarks = questions.reduce((a, q) => a + q.marks, 0);

  const handleDownload = (type) => {
    // In real implementation, this calls FastAPI /export endpoint
    // For demo: trigger a mock download
    const content = generatePaperText(questions);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'pdf' ? 'ExamPaper.txt' : 'ExamPaper.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

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

        {/* Download cards */}
        <div className="download-cards">
          <div className="download-card glass-card" onClick={() => handleDownload('pdf')}>
            <div className="dc-icon">📄</div>
            <div className="dc-label">Download PDF</div>
            <div className="dc-sub">Print-ready format</div>
            <button className="btn-primary dc-btn">Download PDF</button>
          </div>

          <div className="download-card glass-card" onClick={() => handleDownload('docx')}>
            <div className="dc-icon">📝</div>
            <div className="dc-label">Download DOCX</div>
            <div className="dc-sub">Editable Word format</div>
            <button className="btn-secondary dc-btn" style={{ width: '100%' }}>Download DOCX</button>
          </div>
        </div>

        {/* Paper summary */}
        <div className="paper-summary glass-card">
          <h3>Paper Summary</h3>
          <div className="summary-grid">
            {[
              { label: 'Total Questions', val: questions.length },
              { label: 'Total Marks', val: totalMarks },
              { label: 'Bloom\'s Levels', val: [...new Set(questions.map(q => q.level))].length },
              { label: 'Topics Covered', val: [...new Set(questions.map(q => q.topic))].length },
            ].map(s => (
              <div key={s.label} className="summary-grid-item">
                <div className="sgi-val">{s.val}</div>
                <div className="sgi-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Included docs */}
        <div className="included-docs glass-card">
          <h3>What's Included</h3>
          <div className="docs-list">
            {[
              { icon: '📋', label: 'Question Paper', desc: 'Formatted, ready to print or share' },
              { icon: '🔑', label: 'Answer Key', desc: 'Model answers for all questions' },
              { icon: '📊', label: 'Audit Report', desc: 'Coverage & Bloom\'s distribution proof' },
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

function generatePaperText(questions) {
  let out = '=== EXAM PAPER ===\n\n';
  questions.forEach((q, i) => {
    out += `Q${i + 1}. [${q.level} | ${q.marks} marks]\n${q.question}\n\n`;
  });
  out += '\n=== ANSWER KEY ===\n\n';
  questions.forEach((q, i) => {
    out += `Q${i + 1}. ${q.answer}\n\n`;
  });
  return out;
}

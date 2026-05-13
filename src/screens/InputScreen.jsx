import { useState, useRef } from 'react';
import { parsePdf } from '../api/client';
import './InputScreen.css';

const BLOOM_LEVELS = [
  { id: 'remember', label: 'Remember', color: 'chip-blue', desc: 'Recall facts & concepts' },
  { id: 'understand', label: 'Understand', color: 'chip-purple', desc: 'Explain ideas in own words' },
  { id: 'apply', label: 'Apply', color: 'chip-green', desc: 'Use in new situations' },
  { id: 'analyse', label: 'Analyse', color: 'chip-orange', desc: 'Draw connections & patterns' },
  { id: 'evaluate', label: 'Evaluate', color: 'chip-blue', desc: 'Justify decisions & critiques' },
  { id: 'create', label: 'Create', color: 'chip-purple', desc: 'Produce new or original work' },
];

export default function InputScreen({ onGenerate }) {
  const [syllabus, setSyllabus] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedLevels, setSelectedLevels] = useState({});
  const [questionCounts, setQuestionCounts] = useState({});
  const [customLevels, setCustomLevels] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [marks, setMarks] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const allLevels = [...BLOOM_LEVELS, ...customLevels];

  const toggleLevel = (id) => {
    setSelectedLevels(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (!next[id]) {
        const c = { ...questionCounts }; delete c[id];
        setQuestionCounts(c);
        const m = { ...marks }; delete m[id];
        setMarks(m);
      }
      return next;
    });
  };

  const addCustomLevel = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    const id = trimmed.toLowerCase().replace(/\s+/g, '_');
    setCustomLevels(prev => [...prev, { id, label: trimmed, color: 'chip-orange', desc: 'Custom level', custom: true }]);
    setCustomInput('');
  };

  const removeCustomLevel = (id) => {
    setCustomLevels(prev => prev.filter(l => l.id !== id));
    const s = { ...selectedLevels }; delete s[id];
    const q = { ...questionCounts }; delete q[id];
    const m = { ...marks }; delete m[id];
    setSelectedLevels(s); setQuestionCounts(q); setMarks(m);
  };

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);

    if (file.name.endsWith('.pdf')) {
      try {
        const data = await parsePdf(file);
        setSyllabus(data.text);
      } catch {
        setSyllabus('(PDF uploaded — text extraction failed, paste syllabus manually)');
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setSyllabus(e.target.result);
      reader.readAsText(file);
    }
  };

  const totalQuestions = Object.entries(questionCounts)
    .filter(([k]) => selectedLevels[k])
    .reduce((a, b) => a + (parseInt(b[1]) || 0), 0);

  const canGenerate = (syllabus.trim() || fileName) &&
    Object.keys(selectedLevels).some(k => selectedLevels[k]) &&
    totalQuestions > 0;

  const handleSubmit = () => {
    if (!canGenerate) return;
    const config = {
      syllabus,
      fileName,
      levels: allLevels
        .filter(l => selectedLevels[l.id])
        .map(l => ({ ...l, count: parseInt(questionCounts[l.id]) || 0, marks: parseInt(marks[l.id]) || 2 }))
    };
    onGenerate(config);
  };

  return (
    <div className="input-screen">
      <div className="orb orb-1" /><div className="orb orb-2" />

      <div className="input-header animate-fade-up">
        <h1>Configure Your <span className="gradient-text">Exam Paper</span></h1>
        <p>Provide your syllabus and define the question distribution below</p>
      </div>

      <div className="input-body">
        {/* Syllabus */}
        <section className="glass-card input-section animate-fade-up">
          <div className="section-title">
            <span className="section-icon">📄</span>
            <div>
              <h2>Syllabus / Topics</h2>
              <p>Upload a PDF or paste your syllabus text directly</p>
            </div>
          </div>

          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''} ${fileName ? 'has-file' : ''}`}
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <input
              ref={fileRef} type="file" accept=".pdf,.txt"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {fileName ? (
              <div className="file-indicator">
                <span className="file-icon">📎</span>
                <span className="file-name">{fileName}</span>
                <button className="file-remove" onClick={(e) => { e.stopPropagation(); setFileName(''); setSyllabus(''); }}>✕</button>
              </div>
            ) : (
              <>
                <div className="drop-icon">☁️</div>
                <p className="drop-label">Drag & drop a PDF or click to browse</p>
                <p className="drop-sub">Supports .pdf and .txt files</p>
              </>
            )}
          </div>

          <div className="divider"><span>or paste text</span></div>

          <textarea
            className="syllabus-textarea"
            placeholder="Paste your syllabus topics here... e.g.&#10;Chapter 1: Introduction to Data Structures&#10;Chapter 2: Arrays and Linked Lists&#10;Chapter 3: Trees and Graphs..."
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            rows={6}
          />
        </section>

        {/* Bloom's Taxonomy */}
        <section className="glass-card input-section animate-fade-up">
          <div className="section-title">
            <span className="section-icon">🧠</span>
            <div>
              <h2>Bloom's Taxonomy Levels</h2>
              <p>Select the cognitive levels you want questions for, then set counts</p>
            </div>
          </div>

          <div className="bloom-grid">
            {allLevels.map((level) => (
              <div
                key={level.id}
                className={`bloom-card ${selectedLevels[level.id] ? 'selected' : ''}`}
                onClick={() => toggleLevel(level.id)}
              >
                <div className="bloom-top">
                  <div className={`bloom-check ${selectedLevels[level.id] ? 'checked' : ''}`}>
                    {selectedLevels[level.id] ? '✓' : ''}
                  </div>
                  <span className={`chip ${level.color}`}>{level.label}</span>
                  {level.custom && (
                    <button className="bloom-remove" onClick={(e) => { e.stopPropagation(); removeCustomLevel(level.id); }}>✕</button>
                  )}
                </div>
                <p className="bloom-desc">{level.desc}</p>

                {selectedLevels[level.id] && (
                  <div className="bloom-inputs" onClick={(e) => e.stopPropagation()}>
                    <div className="bloom-input-group">
                      <label>Questions</label>
                      <input
                        type="number" min="1" max="30"
                        placeholder="e.g. 5"
                        value={questionCounts[level.id] || ''}
                        onChange={(e) => setQuestionCounts(p => ({ ...p, [level.id]: e.target.value }))}
                      />
                    </div>
                    <div className="bloom-input-group">
                      <label>Marks each</label>
                      <input
                        type="number" min="1" max="20"
                        placeholder="e.g. 2"
                        value={marks[level.id] || ''}
                        onChange={(e) => setMarks(p => ({ ...p, [level.id]: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add custom level */}
          <div className="custom-level-row">
            <input
              className="custom-level-input"
              placeholder="Add a custom level (e.g. Synthesise)..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomLevel()}
            />
            <button className="btn-secondary" onClick={addCustomLevel}>+ Add Level</button>
          </div>
        </section>

        {/* Summary bar */}
        <div className={`summary-bar glass-card animate-fade-up ${canGenerate ? 'ready' : ''}`}>
          <div className="summary-info">
            <div className="summary-stat">
              <span className="summary-val">{totalQuestions}</span>
              <span className="summary-label">Total Questions</span>
            </div>
            <div className="summary-stat">
              <span className="summary-val">
                {Object.keys(selectedLevels).filter(k => selectedLevels[k]).length}
              </span>
              <span className="summary-label">Bloom's Levels</span>
            </div>
            <div className="summary-stat">
              <span className="summary-val">
                {Object.entries(marks)
                  .filter(([k]) => selectedLevels[k])
                  .reduce((a, [k, v]) => a + ((parseInt(v) || 2) * (parseInt(questionCounts[k]) || 0)), 0)}
              </span>
              <span className="summary-label">Total Marks</span>
            </div>
          </div>
          <button className="btn-primary" disabled={!canGenerate} onClick={handleSubmit}>
            Generate Paper →
          </button>
        </div>
      </div>
    </div>
  );
}

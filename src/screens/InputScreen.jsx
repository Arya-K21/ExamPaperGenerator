import { useState, useRef, useEffect } from 'react';
import { parsePdf, parseVoiceCommand } from '../api/client';
import './InputScreen.css';

const BLOOM_LEVELS = [
  { id: 'remember',   label: 'Remember',   color: 'chip-blue',   desc: 'Recall facts & concepts' },
  { id: 'understand', label: 'Understand', color: 'chip-purple', desc: 'Explain ideas in own words' },
  { id: 'apply',      label: 'Apply',      color: 'chip-green',  desc: 'Use in new situations' },
  { id: 'analyse',    label: 'Analyse',    color: 'chip-orange', desc: 'Draw connections & patterns' },
  { id: 'evaluate',   label: 'Evaluate',   color: 'chip-blue',   desc: 'Justify decisions & critiques' },
  { id: 'create',     label: 'Create',     color: 'chip-purple', desc: 'Produce new or original work' },
];

const DIFFICULTY_PRESETS = {
  easy: {
    label: '🟢 Easy',
    desc: 'Foundation recall & comprehension',
    levels: { remember: true, understand: true, apply: true },
    counts: { remember: 6, understand: 6, apply: 4 },
    marks:  { remember: 2, understand: 2, apply: 3 },
  },
  medium: {
    label: '🟡 Medium',
    desc: 'Balanced application & analysis',
    levels: { apply: true, analyse: true, evaluate: true },
    counts: { apply: 5, analyse: 5, evaluate: 4 },
    marks:  { apply: 3, analyse: 3, evaluate: 4 },
  },
  hard: {
    label: '🔴 Hard',
    desc: 'Critical thinking & synthesis',
    levels: { analyse: true, evaluate: true, create: true },
    counts: { analyse: 5, evaluate: 5, create: 4 },
    marks:  { analyse: 3, evaluate: 4, create: 5 },
  },
};

export default function InputScreen({ onGenerate, onBack }) {
  const [syllabus, setSyllabus]         = useState('');
  const [fileName, setFileName]         = useState('');
  const [selectedLevels, setSelectedLevels] = useState({});
  const [questionCounts, setQuestionCounts] = useState({});
  const [customLevels, setCustomLevels] = useState([]);
  const [customInput, setCustomInput]   = useState('');
  const [marks, setMarks]               = useState({});
  const [dragOver, setDragOver]         = useState(false);
  const [isListening, setIsListening]   = useState(false);
  const [isParsingVoice, setIsParsingVoice] = useState(false);
  // New feature state
  const [difficulty, setDifficulty]     = useState(null);   // 'easy' | 'medium' | 'hard' | null
  const [sets, setSets]                 = useState(1);      // 1 | 2 | 3
  const [isBacklog, setIsBacklog]       = useState(false);
  const [backlogFile, setBacklogFile]   = useState('');
  const [backlogText, setBacklogText]   = useState('');
  const backlogRef = useRef();
  const fileRef = useRef();
  const recognitionRef = useRef(null);
  const transcriptBuffer = useRef('');

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        transcriptBuffer.current = '';
      };
      
      recognitionRef.current.onend = async () => {
        setIsListening(false);
        const finalTranscript = transcriptBuffer.current.trim();
        transcriptBuffer.current = ''; // reset
        
        if (finalTranscript) {
          setIsParsingVoice(true);
          try {
            const parsed = await parseVoiceCommand(finalTranscript);
            if (parsed.syllabus) setSyllabus(parsed.syllabus);
            
            if (parsed.levels && parsed.levels.length > 0) {
              setSelectedLevels(prev => {
                const next = { ...prev };
                parsed.levels.forEach(lv => next[lv.id] = true);
                return next;
              });
              
              setQuestionCounts(prev => {
                const next = { ...prev };
                parsed.levels.forEach(lv => next[lv.id] = lv.count);
                return next;
              });
              
              setMarks(prev => {
                const next = { ...prev };
                parsed.levels.forEach(lv => next[lv.id] = lv.marks || 2);
                return next;
              });
            } else {
              setSyllabus(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + finalTranscript);
            }
          } catch (e) {
            console.error("Voice parse failed", e);
            setSyllabus(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + finalTranscript);
          } finally {
            setIsParsingVoice(false);
          }
        }
      };
      
      recognitionRef.current.onresult = (event) => {
        let newTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            newTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (newTranscript.trim()) {
          transcriptBuffer.current += newTranscript;
        }
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please try Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

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

  const applyDifficultyPreset = (key) => {
    const preset = DIFFICULTY_PRESETS[key];
    setDifficulty(key);
    setSelectedLevels(preset.levels);
    setQuestionCounts(preset.counts);
    setMarks(preset.marks);
  };

  const handleBacklogFile = async (file) => {
    if (!file) return;
    setBacklogFile(file.name);
    if (file.name.endsWith('.pdf')) {
      try { const d = await parsePdf(file); setBacklogText(d.text); }
      catch { setBacklogText('(PDF uploaded — paste text if extraction fails)'); }
    } else {
      const r = new FileReader();
      r.onload = e => setBacklogText(e.target.result);
      r.readAsText(file);
    }
  };

  const handleSubmit = () => {
    if (!canGenerate) return;
    const config = {
      syllabus,
      fileName,
      sets,
      isBacklog,
      backlogText,
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

          <div className="divider"><span>or magic voice command</span></div>

          <div className="voice-controls">
            <button 
              className={`voice-btn ${isListening ? 'active' : ''}`} 
              onClick={toggleListening}
              disabled={isParsingVoice}
            >
              {isListening ? '🛑 Stop Listening' : '✨ AI Voice Command'}
            </button>
            {isListening && <span className="listening-pulse">Listening to your command...</span>}
            {isParsingVoice && <span className="listening-pulse" style={{color: '#4f8ef7'}}>✨ Parsing command and configuring UI...</span>}
          </div>

          <textarea
            className="syllabus-textarea"
            placeholder="Paste your syllabus topics here... e.g.&#10;Chapter 1: Introduction to Data Structures&#10;Chapter 2: Arrays and Linked Lists&#10;Chapter 3: Trees and Graphs..."
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            rows={6}
          />
        </section>

        {/* ── Difficulty Preset ── */}
        <section className="glass-card input-section animate-fade-up">
          <div className="section-title">
            <span className="section-icon">🎯</span>
            <div>
              <h2>Difficulty Preset</h2>
              <p>Auto-configure Bloom's levels, counts & marks — or set them manually below</p>
            </div>
          </div>
          <div className="difficulty-presets">
            {Object.entries(DIFFICULTY_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                className={`diff-preset-btn ${difficulty === key ? 'active' : ''} diff-${key}`}
                onClick={() => applyDifficultyPreset(key)}
              >
                <span className="diff-label">{preset.label}</span>
                <span className="diff-desc">{preset.desc}</span>
              </button>
            ))}
            {difficulty && (
              <button className="diff-preset-btn diff-clear" onClick={() => setDifficulty(null)}>
                <span className="diff-label">✕ Clear</span>
                <span className="diff-desc">Configure manually</span>
              </button>
            )}
          </div>
        </section>

        {/* ── Paper Sets ── */}
        <section className="glass-card input-section animate-fade-up">
          <div className="section-title">
            <span className="section-icon">📑</span>
            <div>
              <h2>Multiple Paper Sets</h2>
              <p>Generate Set A / B / C with the same questions in different orders</p>
            </div>
          </div>
          <div className="sets-selector">
            {[1, 2, 3].map(n => (
              <button
                key={n}
                className={`sets-btn ${sets === n ? 'active' : ''}`}
                onClick={() => setSets(n)}
              >
                {n === 1 ? '📄 Set A only' : n === 2 ? '📄📄 Sets A + B' : '📄📄📄 Sets A + B + C'}
              </button>
            ))}
          </div>
        </section>

        {/* ── Backlog Mode ── */}
        <section className="glass-card input-section animate-fade-up">
          <div className="section-title">
            <span className="section-icon">🕒</span>
            <div>
              <h2>Backlog Paper Mode</h2>
              <p>Upload a previous semester paper — the AI will generate a related new paper with similar topic weights</p>
            </div>
            <label className="backlog-toggle-wrap">
              <div
                className={`toggle-switch ${isBacklog ? 'on' : ''}`}
                onClick={() => setIsBacklog(p => !p)}
              >
                <div className="toggle-knob" />
              </div>
              <span className="toggle-label">{isBacklog ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          {isBacklog && (
            <div className="backlog-upload animate-fade">
              <p className="backlog-hint">
                ⚠️ Questions in the new paper will be <strong>topically related</strong> but not identical to the uploaded paper.
              </p>
              <div
                className={`drop-zone ${backlogFile ? 'has-file' : ''}`}
                onClick={() => backlogRef.current.click()}
              >
                <input
                  ref={backlogRef} type="file" accept=".pdf,.txt"
                  style={{ display: 'none' }}
                  onChange={e => handleBacklogFile(e.target.files[0])}
                />
                {backlogFile ? (
                  <div className="file-indicator">
                    <span className="file-icon">📎</span>
                    <span className="file-name">{backlogFile}</span>
                    <button className="file-remove" onClick={e => { e.stopPropagation(); setBacklogFile(''); setBacklogText(''); }}>✕</button>
                  </div>
                ) : (
                  <>
                    <div className="drop-icon">🕒</div>
                    <div className="drop-label">Upload Previous Semester Paper</div>
                    <div className="drop-sub">PDF or TXT — questions will be mapped to similar topics</div>
                  </>
                )}
              </div>
            </div>
          )}
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

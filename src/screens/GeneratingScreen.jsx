import { useEffect, useRef, useState } from 'react';
import { generatePaper } from '../api/client';
import { getMockAudit, getMockQuestions, detectSubject } from '../data/mockData';
import './GeneratingScreen.css';

const STEPS = [
  { icon: '📄', label: 'Parsing syllabus and extracting topics...', duration: 1800 },
  { icon: '🧠', label: "Mapping topics to Bloom's taxonomy levels...", duration: 1600 },
  { icon: '✍️', label: 'Generating questions with Gemini agent...', duration: 2400 },
  { icon: '🔑', label: 'Creating answer keys for each question...', duration: 1600 },
  { icon: '🔍', label: 'Running originality & similarity checks...', duration: 1400 },
  { icon: '📊', label: 'Auditing coverage and balance...', duration: 1000 },
];

const TOTAL_ANIMATION_MS = STEPS.reduce((a, s) => a + s.duration, 0) + 400;

export default function GeneratingScreen({ config, onDone }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [error, setError] = useState(null);

  const apiResultRef = useRef(null);
  const animDoneRef  = useRef(false);
  const apiDoneRef   = useRef(false);

  // Try to resolve both: animation done + API done
  const tryResolve = () => {
    if (animDoneRef.current && apiDoneRef.current) {
      onDone(apiResultRef.current); // may be null on error → caller uses mock
    }
  };

  // ── Animation ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let step = 0;
    const advance = () => {
      if (step >= STEPS.length) {
        animDoneRef.current = true;
        tryResolve();
        return;
      }
      const s = step;
      setTimeout(() => {
        setCurrentStep(s + 1);
        setCompleted(prev => [...prev, s]);
        step = s + 1;
        advance();
      }, STEPS[s].duration);
    };
    const t = setTimeout(advance, 400);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── API call ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!config) {
      apiDoneRef.current = true;
      tryResolve();
      return;
    }

    generatePaper(config.syllabus, config.levels)
      .then((result) => {
        apiResultRef.current = result;
      })
      .catch((err) => {
        console.warn('API error, falling back to mock data:', err.message);
        // Graceful fallback: build a mock result using detected subject
        const subject = detectSubject(config.syllabus || '');
        apiResultRef.current = {
          questions: getMockQuestions(subject),
          audit: getMockAudit(subject),
        };
        setError(`API unavailable — showing demo data. (${err.message})`);
      })
      .finally(() => {
        apiDoneRef.current = true;
        tryResolve();
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const progress = Math.round((completed.length / STEPS.length) * 100);

  return (
    <div className="gen-screen">
      <div className="orb orb-1" /><div className="orb orb-2" />

      <div className="gen-content animate-fade-up">
        <div className="gen-icon-wrap">
          <div className="gen-ring" />
          <div className="gen-icon">✦</div>
        </div>

        <h1>Generating Your <span className="gradient-text">Exam Paper</span></h1>
        <p className="gen-sub">
          Gemini is working across {config?.levels?.length || 0} Bloom's levels
        </p>

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label">{progress}%</span>
        </div>

        <div className="steps-list">
          {STEPS.map((step, i) => {
            const isDone = completed.includes(i);
            const isActive = currentStep === i;
            return (
              <div key={i} className={`step-row ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                <div className="step-icon-wrap">
                  {isDone ? (
                    <span className="step-check">✓</span>
                  ) : isActive ? (
                    <span className="step-spinner" />
                  ) : (
                    <span className="step-num">{i + 1}</span>
                  )}
                </div>
                <span className="step-icon">{step.icon}</span>
                <span className="step-label">{step.label}</span>
              </div>
            );
          })}
        </div>

        {error ? (
          <p className="gen-note gen-warn">⚠️ {error}</p>
        ) : (
          <p className="gen-note">This usually takes about 20–30 seconds. Please don't close this tab.</p>
        )}
      </div>
    </div>
  );
}

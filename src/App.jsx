import { useState, useCallback, useEffect } from 'react';
import Landing from './screens/Landing';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import InputScreen from './screens/InputScreen';
import GeneratingScreen from './screens/GeneratingScreen';
import AuditScreen from './screens/AuditScreen';
import ReviewScreen from './screens/ReviewScreen';
import DownloadScreen from './screens/DownloadScreen';
import QuestionBankScreen from './screens/QuestionBankScreen';
import { generatePaper } from './api/client';
import './App.css';

const SCREENS = {
  LOGIN: 'login',
  REGISTER: 'register',
  LANDING: 'landing',
  INPUT: 'input',
  GENERATING: 'generating',
  AUDIT: 'audit',
  REVIEW: 'review',
  DOWNLOAD: 'download',
  QUESTION_BANK: 'question_bank',
};

const PAPER_STEPS = [
  { id: SCREENS.INPUT,      label: 'Configure' },
  { id: SCREENS.GENERATING, label: 'Generate'  },
  { id: SCREENS.AUDIT,      label: 'Audit'     },
  { id: SCREENS.REVIEW,     label: 'Review'    },
  { id: SCREENS.DOWNLOAD,   label: 'Download'  },
];
const PAPER_STEP_ORDER = PAPER_STEPS.map(s => s.id);

export default function App() {
  const [screen, setScreen]   = useState(SCREENS.LOGIN);
  const [teacher, setTeacher] = useState(null);

  const [config, setConfig]   = useState(null);
  const [apiResult, setApiResult]   = useState(null);
  const [approvedQuestions, setApprovedQuestions] = useState([]);

  // Check for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem('examforge_teacher');
    if (stored) {
      try {
        setTeacher(JSON.parse(stored));
        setScreen(SCREENS.LANDING);
      } catch {
        localStorage.removeItem('examforge_teacher');
      }
    }
  }, []);

  const handleLogin = (teacherData) => {
    setTeacher(teacherData);
    setScreen(SCREENS.LANDING);
  };

  const handleSignOut = () => {
    localStorage.removeItem('examforge_teacher');
    setTeacher(null);
    setScreen(SCREENS.LOGIN);
    setConfig(null);
    setApiResult(null);
    setApprovedQuestions([]);
  };

  const handleStart = (mode) => {
    if (mode === 'bank') {
      setScreen(SCREENS.QUESTION_BANK);
    } else {
      setScreen(SCREENS.INPUT);
    }
  };

  const handleGenerate = (cfg) => {
    setConfig(cfg);
    setApiResult(null);
    setScreen(SCREENS.GENERATING);
  };

  const handleGenerationDone = useCallback((result) => {
    if (result) setApiResult(result);
    setScreen(SCREENS.AUDIT);
  }, []);

  const handleApprove = (questions) => {
    setApprovedQuestions(questions);
    setScreen(SCREENS.DOWNLOAD);
  };

  const handleRestart = () => {
    setScreen(SCREENS.LANDING);
    setConfig(null);
    setApiResult(null);
    setApprovedQuestions([]);
  };

  // Step indicator logic
  const currentStepIdx = PAPER_STEP_ORDER.indexOf(screen);
  const showStepIndicator = currentStepIdx !== -1;

  // ── Render ──────────────────────────────────────────────────────────────
  if (screen === SCREENS.LOGIN)    return <LoginScreen    onLogin={handleLogin} onGoRegister={() => setScreen(SCREENS.REGISTER)} />;
  if (screen === SCREENS.REGISTER) return <RegisterScreen onGoLogin={() => setScreen(SCREENS.LOGIN)} />;

  return (
    <div className="app">

      {/* Top bar — step indicator OR question bank header */}
      {showStepIndicator && (
        <div className="step-indicator">
          {PAPER_STEPS.map((s, i) => {
            const isDone   = i < currentStepIdx;
            const isActive = i === currentStepIdx;
            return (
              <div key={s.id} className="step-indicator-item">
                <div className={`si-dot ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                  {isDone ? '✓' : i + 1}
                </div>
                <span className={`si-label ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  {s.label}
                </span>
                {i < PAPER_STEPS.length - 1 && <div className={`si-line ${isDone ? 'done' : ''}`} />}
              </div>
            );
          })}
          {teacher && (
            <button className="si-user" onClick={handleSignOut} title="Sign out">
              <span className="si-avatar">{teacher.name?.[0] || '?'}</span>
              <span className="si-name">{teacher.name?.split(' ')[0]}</span>
              <span className="si-signout">Sign out</span>
            </button>
          )}
        </div>
      )}

      {/* Screens */}
      {screen === SCREENS.LANDING && (
        <Landing onStart={handleStart} teacher={teacher} onSignOut={handleSignOut} />
      )}
      {screen === SCREENS.INPUT && (
        <InputScreen onGenerate={handleGenerate} onBack={() => setScreen(SCREENS.LANDING)} />
      )}
      {screen === SCREENS.GENERATING && (
        <GeneratingScreen config={config} onDone={handleGenerationDone} />
      )}
      {screen === SCREENS.AUDIT && (
        <AuditScreen
          audit={apiResult?.audit || null}
          syllabus={config?.syllabus || ''}
          onProceed={() => setScreen(SCREENS.REVIEW)}
        />
      )}
      {screen === SCREENS.REVIEW && (
        <ReviewScreen
          questions={apiResult?.questions || null}
          syllabus={config?.syllabus || ''}
          onApprove={handleApprove}
        />
      )}
      {screen === SCREENS.DOWNLOAD && (
        <DownloadScreen
          questions={approvedQuestions}
          config={config}
          onRestart={handleRestart}
        />
      )}
      {screen === SCREENS.QUESTION_BANK && (
        <QuestionBankScreen
          teacher={teacher}
          onBack={() => setScreen(SCREENS.LANDING)}
          onCreatePaper={() => setScreen(SCREENS.INPUT)}
        />
      )}
    </div>
  );
}

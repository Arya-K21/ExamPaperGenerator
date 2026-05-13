import { useState, useCallback } from 'react';
import Landing from './screens/Landing';
import InputScreen from './screens/InputScreen';
import GeneratingScreen from './screens/GeneratingScreen';
import AuditScreen from './screens/AuditScreen';
import ReviewScreen from './screens/ReviewScreen';
import DownloadScreen from './screens/DownloadScreen';
import { generatePaper } from './api/client';
import './App.css';

const SCREENS = {
  LANDING: 'landing',
  INPUT: 'input',
  GENERATING: 'generating',
  AUDIT: 'audit',
  REVIEW: 'review',
  DOWNLOAD: 'download',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.LANDING);
  const [config, setConfig] = useState(null);

  // Real API results
  const [apiResult, setApiResult] = useState(null);   // { questions, audit }
  const [apiError, setApiError] = useState(null);

  // Approved questions for download
  const [approvedQuestions, setApprovedQuestions] = useState([]);

  const handleGenerate = (cfg) => {
    setConfig(cfg);
    setApiResult(null);
    setApiError(null);
    setScreen(SCREENS.GENERATING);
  };

  // Called by GeneratingScreen once both animation + API are done
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
    setApiError(null);
    setApprovedQuestions([]);
  };

  // Step indicator
  const steps = [
    { id: SCREENS.INPUT, label: 'Configure' },
    { id: SCREENS.GENERATING, label: 'Generate' },
    { id: SCREENS.AUDIT, label: 'Audit' },
    { id: SCREENS.REVIEW, label: 'Review' },
    { id: SCREENS.DOWNLOAD, label: 'Download' },
  ];
  const stepOrder = [SCREENS.INPUT, SCREENS.GENERATING, SCREENS.AUDIT, SCREENS.REVIEW, SCREENS.DOWNLOAD];
  const currentStepIdx = stepOrder.indexOf(screen);

  return (
    <div className="app">
      {screen !== SCREENS.LANDING && (
        <div className="step-indicator">
          {steps.map((s, i) => {
            const isDone = i < currentStepIdx;
            const isActive = i === currentStepIdx;
            return (
              <div key={s.id} className="step-indicator-item">
                <div className={`si-dot ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                  {isDone ? '✓' : i + 1}
                </div>
                <span className={`si-label ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  {s.label}
                </span>
                {i < steps.length - 1 && <div className={`si-line ${isDone ? 'done' : ''}`} />}
              </div>
            );
          })}
        </div>
      )}

      {screen === SCREENS.LANDING && <Landing onStart={() => setScreen(SCREENS.INPUT)} />}
      {screen === SCREENS.INPUT && <InputScreen onGenerate={handleGenerate} />}
      {screen === SCREENS.GENERATING && (
        <GeneratingScreen
          config={config}
          onDone={handleGenerationDone}
        />
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
        <DownloadScreen questions={approvedQuestions} onRestart={handleRestart} />
      )}
    </div>
  );
}

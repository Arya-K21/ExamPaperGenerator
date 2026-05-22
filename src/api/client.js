const BASE_URL = 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Generate a full exam paper.
 * @param {string} syllabus - syllabus text
 * @param {Array}  levels   - [{id, label, count, marks}, ...]
 */
export async function generatePaper(syllabus, levels, backlogText = null) {
  return request('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ syllabus, levels, backlog_text: backlogText }),
  });
}

/**
 * Regenerate a single rejected question.
 */
export async function regenerateQuestion({ questionId, questionText, level, topic, marks, reason, syllabus }) {
  return request('/api/regenerate', {
    method: 'POST',
    body: JSON.stringify({
      question_id: questionId,
      question_text: questionText,
      level,
      topic,
      marks,
      reason,
      syllabus,
    }),
  });
}

/**
 * Parse a PDF file and extract syllabus text.
 */
export async function parsePdf(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/api/parse-pdf`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json(); // { text: "..." }
}

export async function parseVoiceCommand(transcript) {
  return request('/api/parse-voice-command', {
    method: 'POST',
    body: JSON.stringify({ transcript }),
  });
}

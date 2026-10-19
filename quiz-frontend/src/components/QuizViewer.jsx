import { useState } from 'react';

export default function QuizViewer({ baseUrl }) {
  const [quizId, setQuizId] = useState('');
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const cleanBaseUrl = (baseUrl || 'http://localhost:8082').replace(/\/$/, '');

  const handleFetchQuiz = async (e) => {
    if (e) e.preventDefault();
    if (!quizId) {
      setError('Please enter a Quiz ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedAnswers({});

    try {
      const response = await fetch(`${cleanBaseUrl}/quiz/get/${quizId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setQuestions(data);
      if (data.length === 0) {
        setError(`Quiz #${quizId} has no questions.`);
      }
    } catch (err) {
      setError(`Failed to fetch quiz #${quizId}: ${err.message}`);
      setQuestions(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="badge method-get">GET</span>
        <h2 className="card-title">Verify & Play Quiz</h2>
      </div>
      <p className="card-subtitle">
        Inspect questions returned by Spring Boot: <code>/quiz/get/{'{id}'}</code>
      </p>

      <form onSubmit={handleFetchQuiz} className="quiz-fetch-form">
        <input
          type="number"
          min="1"
          placeholder="Enter Quiz ID (e.g. 1)"
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
          className="form-input"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-secondary" disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch Quiz'}
        </button>
      </form>

      {error && <div className="status-banner error">{error}</div>}

      {questions && questions.length > 0 && (
        <div className="quiz-questions-list">
          <div className="quiz-meta">
            <strong>Quiz #{quizId}</strong> — {questions.length} Question{questions.length > 1 ? 's' : ''} Loaded
          </div>

          {questions.map((q, idx) => {
            const options = [q.option1, q.option2, q.option3, q.option4].filter(Boolean);
            const userPick = selectedAnswers[q.id];

            return (
              <div key={q.id || idx} className="question-card">
                <div className="question-header">
                  <span className="q-index">Q{idx + 1}</span>
                  <span className="q-title">{q.questionTitle}</span>
                </div>

                <div className="options-grid">
                  {options.map((opt, optIdx) => (
                    <button
                      type="button"
                      key={optIdx}
                      className={`option-btn ${userPick === optIdx ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                    >
                      <span className="opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                      <span className="opt-text">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

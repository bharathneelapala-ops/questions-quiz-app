import { useState, useEffect, useCallback } from 'react';
import { getQuizQuestions } from '../services/quizService';

export default function TakeQuiz({ initialQuizId = '' }) {
  const [quizId, setQuizId] = useState(initialQuizId ? String(initialQuizId) : '');
  const [questions, setQuestions] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const fetchQuizById = useCallback(async (id) => {
    if (!id || id <= 0) {
      setError('Please enter a valid Quiz ID.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuestions(null);
    setAnswers({});
    setCurrentIndex(0);
    setIsCompleted(false);

    try {
      const data = await getQuizQuestions(id);
      if (!data || data.length === 0) {
        setError(`No questions found for Quiz ID #${id}.`);
      } else {
        setQuestions(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load quiz.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialQuizId) return;
    let ignore = false;
    const id = Number(initialQuizId);
    if (!id || id <= 0) return;



    getQuizQuestions(id)
      .then((data) => {
        if (!ignore) {
          if (!data || data.length === 0) {
            setError(`No questions found for Quiz ID #${id}.`);
          } else {
            setQuestions(data);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to load quiz.');
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [initialQuizId]);

  const handleFetchQuiz = (e) => {
    if (e) e.preventDefault();
    fetchQuizById(Number(quizId));
  };

  const handleSelectOption = (questionId, optionKey) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const currentQ = questions ? questions[currentIndex] : null;
  const progressPercent = questions ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <div className="page-card">
      <div className="card-header-block">
        <h1 className="page-heading">Take a Quiz</h1>
        <p className="page-subheading">
          Enter a Quiz ID to load the questions and take the assessment.
        </p>
      </div>

      {/* Quiz ID Loader Form */}
      <form onSubmit={handleFetchQuiz} className="quiz-loader-form">
        <div className="loader-input-wrap">
          <label htmlFor="quiz-id-input" className="visually-hidden">
            Quiz ID
          </label>
          <input
            id="quiz-id-input"
            type="number"
            min="1"
            className="input-text"
            placeholder="Enter Quiz ID (e.g. 1)"
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="primary-btn" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load Quiz'}
          </button>
        </div>
      </form>

      {error && <div className="alert-box error" role="alert">{error}</div>}

      {/* Active Quiz Player */}
      {questions && questions.length > 0 && !isCompleted && currentQ && (
        <div className="quiz-player">
          {/* Progress Bar */}
          <div className="player-progress">
            <div className="progress-labels">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          {/* Question Box */}
          <div className="question-display">
            <h2 className="question-prompt">{currentQ.questionTitle}</h2>

            <div className="options-stack">
              {[
                { key: 'option1', label: 'A', text: currentQ.option1 },
                { key: 'option2', label: 'B', text: currentQ.option2 },
                { key: 'option3', label: 'C', text: currentQ.option3 },
                { key: 'option4', label: 'D', text: currentQ.option4 },
              ]
                .filter((opt) => Boolean(opt.text))
                .map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.key;
                  return (
                    <button
                      type="button"
                      key={opt.key}
                      className={`option-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(currentQ.id, opt.key)}
                    >
                      <span className="option-marker">{opt.label}</span>
                      <span className="option-text">{opt.text}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="player-nav">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              disabled={currentIndex === 0}
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                className="primary-btn"
                onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="primary-btn success-btn"
                onClick={() => setIsCompleted(true)}
              >
                Submit Answers
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completion Screen */}
      {isCompleted && questions && (
        <div className="completion-card">
          <div className="completion-icon">✓</div>
          <h2 className="completion-title">Quiz Completed!</h2>
          <p className="completion-desc">
            You answered {Object.keys(answers).length} out of {questions.length} questions.
          </p>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setIsCompleted(false);
              setCurrentIndex(0);
              setAnswers({});
            }}
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
}

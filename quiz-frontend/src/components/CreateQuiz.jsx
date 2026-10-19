import { useState, useEffect } from 'react';
import { createQuiz, getCategories } from '../services/quizService';

const DEFAULT_CATEGORIES = ['Java', 'Python', 'JavaScript', 'Spring Boot', 'SQL'];
const QUICK_COUNTS = [3, 5, 10, 15, 20];

export default function CreateQuiz({ onQuizCreated, onStartQuiz, initialCategory }) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [category, setCategory] = useState(initialCategory || 'Java');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [numQ, setNumQ] = useState(5);
  const [title, setTitle] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [createdQuizId, setCreatedQuizId] = useState(null);

  // Load distinct categories from backend DB if available
  useEffect(() => {
    let isMounted = true;
    getCategories().then((backendCategories) => {
      if (isMounted && Array.isArray(backendCategories) && backendCategories.length > 0) {
        // Merge backend categories with defaults and deduplicate
        const merged = Array.from(new Set([...backendCategories, ...DEFAULT_CATEGORIES]));
        setCategories(merged);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const effectiveCategory = isCustomCategory ? customCategory.trim() : category;
  const effectiveTitle = title.trim() || (effectiveCategory ? `${effectiveCategory} Quiz` : 'New Quiz');

  // Preview of the exact Query String being sent to Spring Boot
  const queryPreview = new URLSearchParams({
    category: effectiveCategory || '(category)',
    numQ: String(numQ),
    title: effectiveTitle,
  }).toString();

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomCategory(true);
      setCustomCategory('');
    } else {
      setIsCustomCategory(false);
      setCategory(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!effectiveCategory) {
      setFeedback({ type: 'error', text: 'Please select or enter a Category filter.' });
      return;
    }
    if (numQ < 1) {
      setFeedback({ type: 'error', text: 'Number of questions must be at least 1.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    setCreatedQuizId(null);

    try {
      const responseText = await createQuiz({
        category: effectiveCategory,
        numQ,
        title: effectiveTitle,
      });

      // Try to parse quiz ID from response message (e.g. "Quiz #5")
      const idMatch = responseText.match(/#(\d+)/);
      const parsedId = idMatch ? idMatch[1] : null;

      if (parsedId) {
        setCreatedQuizId(parsedId);
      }

      setFeedback({
        type: 'success',
        text: responseText || `Quiz "${effectiveTitle}" created successfully with ${numQ} questions!`,
      });

      if (onQuizCreated) {
        onQuizCreated({ id: parsedId, title: effectiveTitle, category: effectiveCategory, numQ });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to create quiz. Check if Spring Boot is running on port 8082.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-card wireframe-container">
      {/* Header */}
      <div className="card-header-block">
        <h1 className="page-heading">Quiz Generator</h1>
        <p className="page-subheading">
          Filter questions by Category and Count to assemble an automated quiz.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="quiz-form" noValidate>
        {/* Wireframe Filter Bar: [ Category ] [ NumOfQuest ] */}
        <div className="filters-wireframe-bar" role="toolbar" aria-label="Quiz Filters">
          {/* Filter 1: Category */}
          <div className="filter-pill-control">
            <span className="filter-pill-label">Category</span>
            {!isCustomCategory ? (
              <select
                id="filter-category-select"
                className="filter-select"
                value={category}
                onChange={handleCategoryChange}
                disabled={isSubmitting}
                aria-label="Category Filter"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__custom__">+ Custom Category...</option>
              </select>
            ) : (
              <div className="custom-category-inline">
                <input
                  type="text"
                  className="filter-input-text"
                  placeholder="Type category..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                />
                <button
                  type="button"
                  className="filter-btn-reset"
                  onClick={() => setIsCustomCategory(false)}
                  title="Switch back to dropdown"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Filter 2: NumOfQuest */}
          <div className="filter-pill-control">
            <span className="filter-pill-label">NumOfQuest</span>
            <div className="filter-number-group">
              <button
                type="button"
                className="filter-step-btn"
                onClick={() => setNumQ((n) => Math.max(1, n - 1))}
                disabled={isSubmitting || numQ <= 1}
                aria-label="Decrease question count"
              >
                −
              </button>
              <input
                id="filter-numq-input"
                type="number"
                min="1"
                max="50"
                className="filter-input-number"
                value={numQ}
                onChange={(e) => setNumQ(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                disabled={isSubmitting}
                aria-label="Number of Questions"
              />
              <button
                type="button"
                className="filter-step-btn"
                onClick={() => setNumQ((n) => Math.min(50, n + 1))}
                disabled={isSubmitting || numQ >= 50}
                aria-label="Increase question count"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Quick count chips for convenience */}
        <div className="quick-filter-row">
          <span className="quick-filter-hint">Quick count:</span>
          {QUICK_COUNTS.map((cnt) => (
            <button
              type="button"
              key={cnt}
              className={`chip-pill ${numQ === cnt ? 'active' : ''}`}
              onClick={() => setNumQ(cnt)}
              disabled={isSubmitting}
            >
              {cnt}
            </button>
          ))}
        </div>

        {/* Live Query Parameters Mapping Inspector */}
        <div className="query-mapping-card">
          <div className="query-mapping-header">
            <span className="query-method-badge">POST</span>
            <span className="query-endpoint-name">/quiz/create</span>
            <span className="query-mapping-tag">URL Query Parameters</span>
          </div>
          <div className="query-mapping-body">
            <code>?{queryPreview}</code>
          </div>
        </div>

        {/* Expandable Quiz Title (Optional) */}
        <div className="form-item title-config-section">
          <button
            type="button"
            className="toggle-title-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span>{showAdvanced ? '▼' : '►'} Customize Quiz Title (optional)</span>
            <span className="current-title-badge">{effectiveTitle}</span>
          </button>

          {showAdvanced && (
            <div className="title-input-wrapper">
              <label htmlFor="quiz-title-input" className="label">Quiz Title</label>
              <input
                id="quiz-title-input"
                type="text"
                className="input-text"
                placeholder={`e.g. ${effectiveCategory} Assessment`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
              />
              <span className="caption">Leave empty to use automatic name: "{effectiveCategory} Quiz"</span>
            </div>
          )}
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`alert-box ${feedback.type}`} role="alert" aria-live="polite">
            <div className="alert-content">
              <span>{feedback.text}</span>
              {createdQuizId && onStartQuiz && (
                <button
                  type="button"
                  className="start-quiz-btn"
                  onClick={() => onStartQuiz(createdQuizId)}
                >
                  Start Quiz #{createdQuizId} Now →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Submit Action */}
        <div className="form-actions">
          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                <span>Generating Quiz...</span>
              </>
            ) : (
              `Generate Quiz (${numQ} ${effectiveCategory} Questions)`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

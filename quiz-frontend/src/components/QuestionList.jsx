import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllQuestions } from '../services/quizService';

export default function QuestionList({ onSelectCategoryForQuiz }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllQuestions();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load questions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    getAllQuestions()
      .then((data) => {
        if (!ignore) {
          setQuestions(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to load questions.');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Extract distinct categories and difficulty levels from data
  const categories = useMemo(() => {
    const set = new Set();
    questions.forEach((q) => {
      if (q.category) set.add(q.category.trim());
    });
    return Array.from(set).sort();
  }, [questions]);

  const difficulties = useMemo(() => {
    const set = new Set();
    questions.forEach((q) => {
      if (q.difficultylevel) set.add(q.difficultylevel.trim());
    });
    return Array.from(set).sort();
  }, [questions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Category filter
      if (selectedCategory !== 'ALL' && q.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== 'ALL' && q.difficultylevel?.toLowerCase() !== selectedDifficulty.toLowerCase()) {
        return false;
      }
      // Search query (matches title, options, category, rightAnswer)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = q.questionTitle?.toLowerCase().includes(query);
        const opt1Match = q.option1?.toLowerCase().includes(query);
        const opt2Match = q.option2?.toLowerCase().includes(query);
        const opt3Match = q.option3?.toLowerCase().includes(query);
        const opt4Match = q.option4?.toLowerCase().includes(query);
        const answerMatch = q.rightAnswer?.toLowerCase().includes(query);
        const catMatch = q.category?.toLowerCase().includes(query);
        return titleMatch || opt1Match || opt2Match || opt3Match || opt4Match || answerMatch || catMatch;
      }
      return true;
    });
  }, [questions, selectedCategory, selectedDifficulty, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = questions.length;
    const easyCount = questions.filter((q) => q.difficultylevel?.toLowerCase() === 'easy').length;
    const medCount = questions.filter((q) => q.difficultylevel?.toLowerCase() === 'medium').length;
    const hardCount = questions.filter((q) => q.difficultylevel?.toLowerCase() === 'hard').length;
    return { total, easyCount, medCount, hardCount };
  }, [questions]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedDifficulty('ALL');
  };

  const getDifficultyClass = (diff) => {
    const d = (diff || '').toLowerCase();
    if (d === 'easy') return 'diff-badge easy';
    if (d === 'medium') return 'diff-badge medium';
    if (d === 'hard') return 'diff-badge hard';
    return 'diff-badge default';
  };

  return (
    <div className="page-card questions-page">
      {/* Header Block */}
      <div className="questions-header-row">
        <div>
          <div className="header-api-badge-row">
            <span className="badge method-get">GET</span>
            <code className="api-endpoint-text">question/allQuestions</code>
          </div>
          <h1 className="page-heading">All Questions</h1>
          <p className="page-subheading">
            Browse, search, and verify all questions currently stored in the database.
          </p>
        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={fetchQuestions}
          disabled={loading}
          title="Reload questions from backend"
        >
          <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>↻</span>
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Metrics Banner */}
      {!loading && !error && questions.length > 0 && (
        <div className="questions-stats-bar">
          <div className="stat-item">
            <span className="stat-label">Total Questions</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-separator" />
          <div className="stat-item">
            <span className="stat-label">Categories</span>
            <span className="stat-value">{categories.length}</span>
          </div>
          <div className="stat-separator" />
          <div className="stat-item">
            <span className="stat-label">Easy</span>
            <span className="stat-value text-easy">{stats.easyCount}</span>
          </div>
          <div className="stat-separator" />
          <div className="stat-item">
            <span className="stat-label">Medium</span>
            <span className="stat-value text-medium">{stats.medCount}</span>
          </div>
          <div className="stat-separator" />
          <div className="stat-item">
            <span className="stat-label">Hard</span>
            <span className="stat-value text-hard">{stats.hardCount}</span>
          </div>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <div className="questions-toolbar">
        {/* Search input */}
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search questions by title, option, answer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="filter-dropdown-wrap">
          <label htmlFor="cat-filter" className="filter-label">Category:</label>
          <select
            id="cat-filter"
            className="filter-select-input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories ({questions.length})</option>
            {categories.map((cat) => {
              const count = questions.filter((q) => q.category?.toLowerCase() === cat.toLowerCase()).length;
              return (
                <option key={cat} value={cat}>
                  {cat} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Difficulty filter */}
        <div className="filter-dropdown-wrap">
          <label htmlFor="diff-filter" className="filter-label">Difficulty:</label>
          <select
            id="diff-filter"
            className="filter-select-input"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="ALL">All Difficulties</option>
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Category Chips */}
      {categories.length > 0 && (
        <div className="category-chips-row" role="group" aria-label="Category quick filter">
          <button
            type="button"
            className={`category-chip ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="questions-loading-state">
          <div className="spinner-large" />
          <p className="loading-text">Fetching questions from <code>/question/allQuestions</code>...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="alert-box error question-error-box" role="alert">
          <div className="error-title">⚠️ Error loading questions</div>
          <p className="error-desc">{error}</p>
          <div className="error-actions">
            <button type="button" className="retry-btn" onClick={fetchQuestions}>
              Try Again
            </button>
            <span className="error-hint">Make sure Spring Boot is running at http://localhost:8082</span>
          </div>
        </div>
      )}

      {/* Empty state (database empty or no results matching filters) */}
      {!loading && !error && filteredQuestions.length === 0 && (
        <div className="questions-empty-state">
          <div className="empty-icon">📂</div>
          <h3 className="empty-title">
            {questions.length === 0 ? 'No questions in database' : 'No matching questions found'}
          </h3>
          <p className="empty-desc">
            {questions.length === 0
              ? 'The question table is currently empty. Add questions via the backend API or seed the database.'
              : 'Try adjusting your search query, category, or difficulty filters.'}
          </p>
          {questions.length > 0 && (
            <button type="button" className="secondary-btn" onClick={handleResetFilters}>
              Reset All Filters
            </button>
          )}
        </div>
      )}

      {/* Questions List */}
      {!loading && !error && filteredQuestions.length > 0 && (
        <div className="questions-list-container">
          <div className="results-count-bar">
            <span>
              Showing <strong>{filteredQuestions.length}</strong> of {questions.length} questions
            </span>
            {(selectedCategory !== 'ALL' || selectedDifficulty !== 'ALL' || searchQuery) && (
              <button type="button" className="reset-link" onClick={handleResetFilters}>
                Clear filters
              </button>
            )}
          </div>

          <div className="questions-cards-grid">
            {filteredQuestions.map((q, idx) => {
              const options = [
                { key: 'option1', label: 'A', text: q.option1 },
                { key: 'option2', label: 'B', text: q.option2 },
                { key: 'option3', label: 'C', text: q.option3 },
                { key: 'option4', label: 'D', text: q.option4 },
              ].filter((opt) => Boolean(opt.text));

              // Index > 4 cards use content-visibility: auto for smooth scroll performance
              const isDeferred = idx >= 4;

              return (
                <article
                  key={q.id || idx}
                  className={`question-item-card ${isDeferred ? 'heavy-question-card' : ''}`}
                >
                  {/* Card Header */}
                  <div className="q-card-top">
                    <div className="q-card-meta">
                      <span className="q-id-pill">#{q.id}</span>
                      {q.category && (
                        <span className="q-cat-pill">{q.category}</span>
                      )}
                      {q.difficultylevel && (
                        <span className={getDifficultyClass(q.difficultylevel)}>
                          {q.difficultylevel}
                        </span>
                      )}
                    </div>

                    {onSelectCategoryForQuiz && q.category && (
                      <button
                        type="button"
                        className="create-from-cat-btn"
                        onClick={() => onSelectCategoryForQuiz(q.category)}
                        title={`Create a quiz using ${q.category}`}
                      >
                        Create Quiz ↗
                      </button>
                    )}
                  </div>

                  {/* Question Title */}
                  <h3 className="q-card-title">{q.questionTitle}</h3>

                  {/* Options */}
                  <div className="q-options-container">
                    {options.map((opt) => {
                      const isCorrect = q.rightAnswer && opt.text?.trim().toLowerCase() === q.rightAnswer.trim().toLowerCase();
                      return (
                        <div
                          key={opt.key}
                          className={`q-option-row ${isCorrect ? 'is-correct-answer' : ''}`}
                        >
                          <span className="q-option-letter">{opt.label}</span>
                          <span className="q-option-text">{opt.text}</span>
                          {isCorrect && (
                            <span className="q-correct-tag" title="Correct Answer">
                              ✓ Correct Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* If rightAnswer didn't match any option directly, show it explicitly */}
                  {q.rightAnswer && !options.some((opt) => opt.text?.trim().toLowerCase() === q.rightAnswer.trim().toLowerCase()) && (
                    <div className="q-fallback-answer">
                      <span className="fallback-label">Correct Answer:</span>
                      <span className="fallback-value">{q.rightAnswer}</span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

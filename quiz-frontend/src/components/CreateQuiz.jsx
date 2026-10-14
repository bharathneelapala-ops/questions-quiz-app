import React, { useState } from 'react';
import { createQuiz } from '../services/quizService';

const SUGGESTED_CATEGORIES = ['Java', 'Python', 'JavaScript', 'Spring Boot', 'SQL'];
const QUICK_COUNTS = [3, 5, 10, 15];

export default function CreateQuiz({ onQuizCreated }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Java');
  const [numQ, setNumQ] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setFeedback({ type: 'error', text: 'Please enter a quiz title.' });
      return;
    }
    if (!category.trim()) {
      setFeedback({ type: 'error', text: 'Please specify a question category.' });
      return;
    }
    if (numQ < 1) {
      setFeedback({ type: 'error', text: 'Number of questions must be at least 1.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await createQuiz({ category, numQ, title });
      setFeedback({
        type: 'success',
        text: `Quiz "${title}" created successfully with ${numQ} questions!`,
      });
      setTitle('');
      if (onQuizCreated) {
        onQuizCreated({ title, category, numQ });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to create quiz. Please check that your backend is running.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-card">
      <div className="card-header-block">
        <h1 className="page-heading">Create a New Quiz</h1>
        <p className="page-subheading">
          Configure quiz settings to automatically generate questions from the database.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="quiz-form" noValidate>
        {/* Title */}
        <div className="form-item">
          <label htmlFor="quiz-title" className="label">
            Quiz Title
          </label>
          <input
            id="quiz-title"
            type="text"
            className="input-text"
            placeholder="e.g. Core Java Assessment"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            required
            autoComplete="off"
          />
          <span className="caption">A clear, descriptive name for the quiz.</span>
        </div>

        {/* Category */}
        <div className="form-item">
          <label htmlFor="quiz-category" className="label">
            Category
          </label>
          <input
            id="quiz-category"
            type="text"
            className="input-text"
            placeholder="e.g. Java"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSubmitting}
            required
            autoComplete="off"
          />
          <div className="preset-row">
            <span className="preset-label">Suggested:</span>
            {SUGGESTED_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`tag-btn ${category.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
                disabled={isSubmitting}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Questions */}
        <div className="form-item">
          <label htmlFor="quiz-numq" className="label">
            Number of Questions
          </label>
          <div className="count-stepper-wrap">
            <div className="stepper-controls">
              <button
                type="button"
                className="step-btn"
                onClick={() => setNumQ((n) => Math.max(1, n - 1))}
                disabled={isSubmitting || numQ <= 1}
                aria-label="Decrease question count"
              >
                −
              </button>
              <input
                id="quiz-numq"
                type="number"
                min="1"
                max="50"
                className="input-number"
                value={numQ}
                onChange={(e) => setNumQ(Math.max(1, Number(e.target.value) || 1))}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="step-btn"
                onClick={() => setNumQ((n) => Math.min(50, n + 1))}
                disabled={isSubmitting || numQ >= 50}
                aria-label="Increase question count"
              >
                +
              </button>
            </div>

            <div className="preset-counts">
              {QUICK_COUNTS.map((count) => (
                <button
                  type="button"
                  key={count}
                  className={`count-pill ${numQ === count ? 'active' : ''}`}
                  onClick={() => setNumQ(count)}
                  disabled={isSubmitting}
                >
                  {count} Questions
                </button>
              ))}
            </div>
          </div>
          <span className="caption">Randomly pulled from the questions library for this category.</span>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`alert-box ${feedback.type}`} role="alert" aria-live="polite">
            {feedback.text}
          </div>
        )}

        {/* Submit */}
        <div className="form-actions">
          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Quiz...' : 'Generate Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}

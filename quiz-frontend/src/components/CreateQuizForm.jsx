import React, { useState, useId } from 'react';

const POPULAR_CATEGORIES = ['Java', 'Python', 'JavaScript', 'Spring Boot', 'SQL'];

export default function CreateQuizForm({ baseUrl, onQuizCreated }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Java');
  const [numQ, setNumQ] = useState(5);
  const [status, setStatus] = useState({ loading: false, type: null, message: null, responseBody: null, statusCode: null });

  const titleId = useId();
  const categoryId = useId();
  const numQId = useId();

  // Construct URL with query parameters matching Spring Boot @RequestParam
  const queryParams = new URLSearchParams({
    category: category.trim(),
    numQ: String(numQ),
    title: title.trim()
  });

  const cleanBaseUrl = (baseUrl || 'http://localhost:8082').replace(/\/$/, '');
  const endpointUrl = `${cleanBaseUrl}/quiz/create?${queryParams.toString()}`;
  const curlCommand = `curl -X POST "${endpointUrl}"`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setStatus({ loading: false, type: 'error', message: 'Please provide a quiz title.' });
      return;
    }
    if (!category.trim()) {
      setStatus({ loading: false, type: 'error', message: 'Please specify a category.' });
      return;
    }

    setStatus({ loading: true, type: null, message: null, responseBody: null, statusCode: 'Sending...' });

    const startTime = performance.now();
    try {
      // POST request without body, query params in URL
      const response = await fetch(endpointUrl, {
        method: 'POST',
      });
      const duration = Math.round(performance.now() - startTime);
      const text = await response.text();

      if (response.ok) {
        setStatus({
          loading: false,
          type: 'success',
          message: `Quiz "${title}" created successfully!`,
          responseBody: text || 'Success',
          statusCode: `${response.status} ${response.statusText} (${duration}ms)`
        });
        if (onQuizCreated) {
          onQuizCreated({ title, category, numQ });
        }
      } else {
        setStatus({
          loading: false,
          type: 'error',
          message: `Server returned ${response.status} ${response.statusText}. Make sure category "${category}" has questions in your database.`,
          responseBody: text,
          statusCode: `${response.status} ${response.statusText} (${duration}ms)`
        });
      }
    } catch (err) {
      setStatus({
        loading: false,
        type: 'error',
        message: `Network error: ${err.message}. Is Spring Boot running on ${cleanBaseUrl} with CORS enabled?`,
        responseBody: err.stack || err.message,
        statusCode: 'Failed'
      });
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="badge method-post">POST</span>
        <h2 className="card-title">Create Quiz</h2>
      </div>
      <p className="card-subtitle">
        Sends parameters via URL query string to Spring Boot: <code>/quiz/create</code>
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <div className="form-group">
          <label htmlFor={titleId} className="form-label">
            Quiz Title
          </label>
          <input
            id={titleId}
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Core Java Fundamentals"
            required
            autoComplete="off"
          />
          <span className="form-hint">Display name for this quiz set</span>
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor={categoryId} className="form-label">
            Category
          </label>
          <input
            id={categoryId}
            type="text"
            className="form-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Java"
            required
            autoComplete="off"
          />
          <div className="chips-container" role="group" aria-label="Quick category select">
            {POPULAR_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`chip ${category.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <span className="form-hint">Must match the category column in your questions database</span>
        </div>

        {/* Number of Questions */}
        <div className="form-group">
          <label htmlFor={numQId} className="form-label">
            Number of Questions ({numQ})
          </label>
          <div className="slider-container">
            <input
              id={numQId}
              type="range"
              min="1"
              max="20"
              value={numQ}
              onChange={(e) => setNumQ(Number(e.target.value))}
              className="form-range"
            />
            <input
              type="number"
              min="1"
              max="50"
              value={numQ}
              onChange={(e) => setNumQ(Math.max(1, Number(e.target.value)))}
              className="number-box"
              aria-label="Direct question count input"
            />
          </div>
          <span className="form-hint">Native SQL selects random questions matching this limit</span>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary" disabled={status.loading}>
          {status.loading ? (
            <>
              <span className="spinner" aria-hidden="true"></span>
              <span>Creating Quiz...</span>
            </>
          ) : (
            'Create Quiz'
          )}
        </button>
      </form>

      {/* Status banner */}
      {status.message && (
        <div className={`status-banner ${status.type}`} role="status" aria-live="polite">
          {status.message}
        </div>
      )}

      {/* Postman Equivalent Inspector */}
      <div className="inspector-card">
        <div className="inspector-title">
          <span>🛠️ Postman Equivalent</span>
          <span>HTTP POST</span>
        </div>

        <div className="inspector-item">
          <div className="inspector-label">URL & Query Parameters</div>
          <pre className="code-block">{endpointUrl}</pre>
        </div>

        <div className="inspector-item">
          <div className="inspector-label">cURL Command</div>
          <pre className="code-block code-green">{curlCommand}</pre>
        </div>

        {status.statusCode && (
          <div className="inspector-item">
            <div className="inspector-label">
              <span>Server Response:</span>
              <span className="status-code">{status.statusCode}</span>
            </div>
            <pre className="code-block">{status.responseBody || '(No content)'}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

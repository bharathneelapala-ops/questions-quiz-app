import React from 'react';

export default function Navbar({ activeTab, onSelectTab }) {
  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <div className="brand-logo">Q</div>
          <span className="brand-name">QuizCraft</span>
        </div>

        <nav className="navbar-links" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-link ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => onSelectTab('create')}
          >
            Create Quiz
          </button>
          <button
            type="button"
            className={`nav-link ${activeTab === 'take' ? 'active' : ''}`}
            onClick={() => onSelectTab('take')}
          >
            Take Quiz
          </button>
        </nav>
      </div>
    </header>
  );
}

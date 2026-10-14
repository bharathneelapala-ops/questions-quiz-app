import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CreateQuiz from './components/CreateQuiz';
import TakeQuiz from './components/TakeQuiz';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="app-layout">
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'create' ? (
          <CreateQuiz onQuizCreated={() => {}} />
        ) : (
          <TakeQuiz />
        )}
      </main>

      <footer className="footer">
        <p>QuizCraft • Connected to Spring Boot API</p>
      </footer>
    </div>
  );
}

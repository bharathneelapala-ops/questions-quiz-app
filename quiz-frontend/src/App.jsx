import { useState } from 'react';
import Navbar from './components/Navbar';
import QuestionList from './components/QuestionList';
import CreateQuiz from './components/CreateQuiz';
import TakeQuiz from './components/TakeQuiz';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('questions');
  const [activeQuizId, setActiveQuizId] = useState('');
  const [quizCategory, setQuizCategory] = useState('');

  const handleQuizCreated = (quizData) => {
    if (quizData?.id) {
      setActiveQuizId(String(quizData.id));
    }
  };

  const handleStartQuiz = (id) => {
    if (id) {
      setActiveQuizId(String(id));
      setActiveTab('take');
    }
  };

  const handleSelectCategoryForQuiz = (category) => {
    setQuizCategory(category);
    setActiveTab('create');
  };

  return (
    <div className="app-layout">
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'questions' && (
          <QuestionList onSelectCategoryForQuiz={handleSelectCategoryForQuiz} />
        )}

        {activeTab === 'create' && (
          <CreateQuiz
            key={quizCategory || 'default'}
            initialCategory={quizCategory}
            onQuizCreated={handleQuizCreated}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {activeTab === 'take' && (
          <TakeQuiz initialQuizId={activeQuizId} />
        )}
      </main>

      <footer className="footer">
        <p>QuizCraft • Connected to Spring Boot API: <code>/question/allQuestions</code> • <code>/quiz</code></p>
      </footer>
    </div>
  );
}

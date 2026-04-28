import React, { useState } from 'react';

const QuizEngine = ({ topicData }) => {
  const [currentDifficulty, setCurrentDifficulty] = useState('medium');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Fallback defaults if topicData is missing
  const defaultQuestions = {
    questions: [
      {
        difficulty: 'medium',
        text: 'What is the reflection of the point (3, -4) across the x-axis?',
        options: ['(-3, -4)', '(3, 4)', '(-3, 4)', '(4, 3)'],
        correctAnswer: '(3, 4)',
        explanation: 'When reflecting across the x-axis, the x-coordinate stays the same and the y-coordinate changes sign.',
        hint: 'Think about which axis acts as the mirror.'
      }
    ]
  };

  const data = topicData || defaultQuestions;
  const questions = data.questions.filter(q => q.difficulty === currentDifficulty);
  const currentQuestion = questions[currentQuestionIndex] || data.questions[0];

  const handleAnswer = (selectedOption) => {
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setFeedback({ isCorrect, explanation: currentQuestion.explanation });
    
    // Adaptive logic placeholder
    if (isCorrect) {
      if (currentDifficulty === 'easy') setCurrentDifficulty('medium');
      else if (currentDifficulty === 'medium') setCurrentDifficulty('hard');
    } else {
      if (currentDifficulty === 'hard') setCurrentDifficulty('medium');
      else if (currentDifficulty === 'medium') setCurrentDifficulty('easy');
    }
  };

  return (
    <div className="quiz-engine max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Level: {currentDifficulty}
        </span>
        <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">Score: 120</span>
      </div>

      <h3 className="text-xl font-bold mb-6">{currentQuestion.text}</h3>
      
      <div className="options-grid grid gap-3">
        {currentQuestion.options.map((opt, i) => (
          <button 
            key={i}
            onClick={() => handleAnswer(opt)}
            disabled={feedback !== null}
            className={`p-4 text-left border rounded-lg transition-colors ${feedback ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-50 hover:border-blue-200'}`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="actions mt-6 flex justify-between">
        <button 
          onClick={() => setShowHint(!showHint)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          disabled={feedback !== null}
        >
          {showHint ? 'Hide Hint' : 'Need a Hint?'}
        </button>
      </div>

      {showHint && !feedback && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm flex gap-2 items-start">
          <span>💡</span> 
          <span>{currentQuestion.hint}</span>
        </div>
      )}

      {feedback && (
        <div className={`mt-6 p-4 border rounded-lg ${feedback.isCorrect ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
          <h4 className="font-bold flex items-center gap-2">
            {feedback.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
          </h4>
          <p className="mt-2 text-sm">{feedback.explanation}</p>
          <button 
            onClick={() => { setFeedback(null); setShowHint(false); setCurrentQuestionIndex(prev => prev + 1); }}
            className="mt-4 px-4 py-2 bg-gray-900 hover:bg-gray-800 transition-colors text-white rounded-lg text-sm font-medium"
          >
            Next Question
          </button>
        </div>
      )}
    </div>
  );
};
export default QuizEngine;
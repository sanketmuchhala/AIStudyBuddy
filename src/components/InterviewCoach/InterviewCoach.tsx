import React, { useState } from 'react';
import { MessageSquare, Brain, Clock, Target } from 'lucide-react';

export function InterviewCoach() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const categories = [
    { id: 'technical', name: 'Technical Questions', icon: Brain, description: 'Coding and technical concepts' },
    { id: 'behavioral', name: 'Behavioral Questions', icon: MessageSquare, description: 'STAR method practice' },
    { id: 'mock', name: 'Mock Interview', icon: Clock, description: 'Timed interview simulation' },
    { id: 'coding', name: 'Coding Challenges', icon: Target, description: 'Algorithm and data structure problems' }
  ];

  const sampleQuestions = {
    technical: [
      'Explain the difference between let, const, and var in JavaScript.',
      'What is a closure and how would you use it?',
      'Describe the event loop in JavaScript.',
      'What are the differences between SQL and NoSQL databases?'
    ],
    behavioral: [
      'Tell me about a time when you had to learn a new technology quickly.',
      'Describe a challenging project you worked on and how you overcame obstacles.',
      'How do you handle disagreements with team members?',
      'Tell me about a time you made a mistake and how you handled it.'
    ],
    coding: [
      'Implement a function to reverse a string.',
      'Find the maximum subarray sum (Kadane\'s algorithm).',
      'Implement a binary search algorithm.',
      'Design a function to detect if a linked list has a cycle.'
    ]
  };

  const startPractice = (category: string) => {
    setSelectedCategory(category);
    const questions = sampleQuestions[category as keyof typeof sampleQuestions] || [];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion({ text: randomQuestion, category });
    setAnswer('');
    setTimeLeft(category === 'mock' ? 300 : 600); // 5 min for mock, 10 min for others
  };

  const submitAnswer = () => {
    if (!answer.trim()) {
      alert('Please provide an answer before submitting.');
      return;
    }
    
    // Simple feedback simulation
    const feedback = {
      score: Math.floor(Math.random() * 3) + 3, // 3-5 score
      strengths: ['Good structure', 'Clear communication'],
      improvements: ['Add more specific examples', 'Consider edge cases']
    };
    
    alert(`Answer submitted! Score: ${feedback.score}/5\nStrengths: ${feedback.strengths.join(', ')}\nImprovements: ${feedback.improvements.join(', ')}`);
    
    // Reset for next question
    setCurrentQuestion(null);
    setAnswer('');
    setSelectedCategory('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            AI Interview Coach
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Practice interviews with AI-powered feedback and adaptive difficulty
          </p>
        </div>

        {!currentQuestion ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => startPractice(category.id)}
                  className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-200 text-left group"
                >
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors duration-200">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)} Question
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Take your time to provide a comprehensive answer
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-primary-600">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-gray-500">Time remaining</p>
              </div>
            </div>

            {/* Question */}
            <div className="card p-6 mb-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Question:
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {currentQuestion.text}
              </p>
            </div>

            {/* Answer Input */}
            <div className="card p-6 mb-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Your Answer:
              </h4>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here... Use the STAR method for behavioral questions (Situation, Task, Action, Result)."
                className="input-field min-h-48 resize-y"
              />
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {answer.length} characters
                </span>
                <div className="space-x-3">
                  <button
                    onClick={() => {
                      setCurrentQuestion(null);
                      setAnswer('');
                      setSelectedCategory('');
                    }}
                    className="btn-secondary"
                  >
                    Skip Question
                  </button>
                  <button
                    onClick={submitAnswer}
                    className="btn-primary"
                  >
                    Submit Answer
                  </button>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="card p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                💡 Tips for this question type:
              </h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {currentQuestion.category === 'behavioral' && (
                  <>
                    <p>• Use the STAR method: Situation, Task, Action, Result</p>
                    <p>• Be specific with examples and quantify your impact</p>
                    <p>• Focus on your individual contributions</p>
                  </>
                )}
                {currentQuestion.category === 'technical' && (
                  <>
                    <p>• Break down complex concepts into simple terms</p>
                    <p>• Provide examples when possible</p>
                    <p>• Mention trade-offs and alternative approaches</p>
                  </>
                )}
                {currentQuestion.category === 'coding' && (
                  <>
                    <p>• Think out loud about your approach</p>
                    <p>• Consider edge cases and time complexity</p>
                    <p>• Start with a working solution, then optimize</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-primary-600 mb-1">12</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Questions Practiced</p>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-success-600 mb-1">4.2/5</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-warning-600 mb-1">85%</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Interview Readiness</p>
        </div>
      </div>
    </div>
  );
}
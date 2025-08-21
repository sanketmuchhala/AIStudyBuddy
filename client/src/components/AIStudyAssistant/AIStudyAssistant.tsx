import React, { useState } from 'react';
import { Bot, BookOpen, Target, Lightbulb, Clock, CheckCircle, Loader2, X } from 'lucide-react';
import { aiService } from '../../services/aiService';

interface AIStudyAssistantProps {
  subjects: string[];
  onClose: () => void;
}

export const AIStudyAssistant: React.FC<AIStudyAssistantProps> = ({ subjects, onClose }) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'explain' | 'practice' | 'plan' | 'analyze'>('recommendations');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || '');
  const [progress, setProgress] = useState(50);
  const [concept, setConcept] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [sessionDuration, setSessionDuration] = useState(60);
  const [sessionTopics, setSessionTopics] = useState('');
  const [sessionPerformance, setSessionPerformance] = useState(7);
  const [availableHours, setAvailableHours] = useState(20);
  const [studyDays, setStudyDays] = useState(7);

  const handleGetRecommendations = async () => {
    if (!selectedSubject) return;
    
    setIsLoading(true);
    setResult('');
    
    try {
      const response = await aiService.getStudyRecommendations(selectedSubject, progress);
      if (response && response.trim()) {
        setResult(response);
      } else {
        setResult(`Here are some general study recommendations for ${selectedSubject}:\n\n1. Start with reviewing fundamentals and key concepts\n2. Practice active recall - try to explain concepts without looking at notes\n3. Use spaced repetition for memorization\n4. Break study sessions into 25-45 minute chunks with breaks\n5. Find practice problems or questions to test your understanding\n6. Connect new material to what you already know\n7. Teach the concept to someone else or explain it out loud`);
      }
    } catch (error) {
      console.error('Study recommendations error:', error);
      setResult(`Here are some general study recommendations for ${selectedSubject}:\n\n1. Start with reviewing fundamentals and key concepts\n2. Practice active recall - try to explain concepts without looking at notes\n3. Use spaced repetition for memorization\n4. Break study sessions into 25-45 minute chunks with breaks\n5. Find practice problems or questions to test your understanding\n6. Connect new material to what you already know\n7. Teach the concept to someone else or explain it out loud\n\nNote: AI service temporarily unavailable, showing general recommendations.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainConcept = async () => {
    if (!concept || !selectedSubject) return;
    
    setIsLoading(true);
    setResult('');
    
    try {
      const response = await aiService.explainConcept(concept, selectedSubject);
      if (response && response.trim()) {
        setResult(response);
      } else {
        setResult(`I'll help explain "${concept}" in the context of ${selectedSubject}:\n\nPlease try the following approach:\n1. Break down the concept into smaller parts\n2. Look for examples and real-world applications\n3. Connect it to other concepts you already understand\n4. Practice with exercises or problems\n5. Try to explain it in your own words\n\nFor more detailed explanations, try searching online resources or textbooks for "${concept} in ${selectedSubject}".`);
      }
    } catch (error) {
      console.error('Explain concept error:', error);
      setResult(`I'll help explain "${concept}" in the context of ${selectedSubject}:\n\nPlease try the following approach:\n1. Break down the concept into smaller parts\n2. Look for examples and real-world applications\n3. Connect it to other concepts you already understand\n4. Practice with exercises or problems\n5. Try to explain it in your own words\n\nFor more detailed explanations, try searching online resources or textbooks for "${concept} in ${selectedSubject}".\n\nNote: AI service temporarily unavailable, showing general guidance.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePractice = async () => {
    if (!topic) return;
    
    setIsLoading(true);
    setResult('');
    
    try {
      const response = await aiService.generatePracticeQuestions(topic, difficulty);
      if (response && response.trim()) {
        setResult(response);
      } else {
        setResult(`Practice Questions for "${topic}" (${difficulty} level):\n\nSample Question Formats:\n\n1. Multiple Choice:\nWhat is the main concept of ${topic}?\nA) Option 1\nB) Option 2\nC) Option 3\nD) Option 4\n\n2. Short Answer:\nExplain the key principles of ${topic}.\n\n3. Problem Solving:\nApply ${topic} to solve the following scenario...\n\nTip: Create your own questions by:\n- Reviewing chapter headings and key terms\n- Converting statements into questions\n- Finding practice problems in textbooks\n- Using online question generators for your subject`);
      }
    } catch (error) {
      console.error('Generate practice error:', error);
      setResult(`Practice Questions for "${topic}" (${difficulty} level):\n\nSample Question Formats:\n\n1. Multiple Choice:\nWhat is the main concept of ${topic}?\nA) Option 1\nB) Option 2\nC) Option 3\nD) Option 4\n\n2. Short Answer:\nExplain the key principles of ${topic}.\n\n3. Problem Solving:\nApply ${topic} to solve the following scenario...\n\nTip: Create your own questions by:\n- Reviewing chapter headings and key terms\n- Converting statements into questions\n- Finding practice problems in textbooks\n- Using online question generators for your subject\n\nNote: AI service temporarily unavailable, showing sample formats.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeSession = async () => {
    if (!sessionTopics) return;
    
    setIsLoading(true);
    setResult('');
    
    try {
      const topics = sessionTopics.split(',').map(t => t.trim()).filter(t => t);
      const response = await aiService.analyzeStudySession(sessionDuration, topics, sessionPerformance);
      setResult(response);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Failed to analyze session'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (subjects.length === 0) return;
    
    setIsLoading(true);
    setResult('');
    
    try {
      const response = await aiService.createStudyPlan(subjects, availableHours, studyDays);
      setResult(response);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Failed to create study plan'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'recommendations', label: 'Recommendations', icon: Target },
    { id: 'explain', label: 'Explain Concept', icon: BookOpen },
    { id: 'practice', label: 'Practice Questions', icon: CheckCircle },
    { id: 'plan', label: 'Study Plan', icon: Clock },
    { id: 'analyze', label: 'Session Analysis', icon: Lightbulb }
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Study Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
            title="Close AI Study Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Compact Sidebar */}
          <div className="w-48 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-2">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-1.5 px-2 py-1.5 rounded-md text-left transition-colors text-sm ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Tab Content */}
            <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-gray-800">
              {activeTab === 'recommendations' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Get Study Recommendations</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subject
                      </label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Progress (%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => setProgress(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-600 mt-1">{progress}%</div>
                    </div>
                    <button
                      onClick={handleGetRecommendations}
                      disabled={isLoading || !selectedSubject}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Recommendations'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'explain' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Explain a Concept</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subject
                      </label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Concept to Explain
                      </label>
                      <input
                        type="text"
                        value={concept}
                        onChange={(e) => setConcept(e.target.value)}
                        placeholder="e.g., Photosynthesis, Calculus, World War II"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleExplainConcept}
                      disabled={isLoading || !concept || !selectedSubject}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Explain Concept'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'practice' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Generate Practice Questions</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Topic
                      </label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Quadratic Equations, Cell Biology, Shakespeare"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Difficulty
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <button
                      onClick={handleGeneratePractice}
                      disabled={isLoading || !topic}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Questions'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'plan' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Create Study Plan</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available Hours
                      </label>
                      <input
                        type="number"
                        value={availableHours}
                        onChange={(e) => setAvailableHours(Number(e.target.value))}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Study Days
                      </label>
                      <input
                        type="number"
                        value={studyDays}
                        onChange={(e) => setStudyDays(Number(e.target.value))}
                        min="1"
                        max="30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subjects to Include
                      </label>
                      <div className="text-sm text-gray-600">
                        {subjects.join(', ')}
                      </div>
                    </div>
                    <button
                      onClick={handleCreatePlan}
                      disabled={isLoading || subjects.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Study Plan'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'analyze' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Analyze Study Session</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Session Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={sessionDuration}
                        onChange={(e) => setSessionDuration(Number(e.target.value))}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Topics Covered (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={sessionTopics}
                        onChange={(e) => setSessionTopics(e.target.value)}
                        placeholder="e.g., Photosynthesis, Cell Division, Genetics"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Self-Assessed Performance (1-10)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={sessionPerformance}
                        onChange={(e) => setSessionPerformance(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-600 mt-1">{sessionPerformance}/10</div>
                    </div>
                    <button
                      onClick={handleAnalyzeSession}
                      disabled={isLoading || !sessionTopics}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Session'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Result */}
            {result && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">AI Response:</h4>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">{result}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

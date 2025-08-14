import React, { useState, useEffect } from 'react';
import { Upload, MessageSquare, Brain, Clock, Target, FileText, ChevronRight, Star, TrendingUp } from 'lucide-react';
import { aiService } from '../../services/aiService';

interface InterviewSession {
  sessionId: string;
  currentQuestion: string;
  questionNumber: number;
  answers: string[];
  scores: number[];
  feedback: string[];
  isComplete: boolean;
  overallScore?: number;
}

export function InterviewCoach() {
  const [step, setStep] = useState<'upload' | 'interview' | 'results'>('upload');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreview, setResumePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId] = useState('demo-user-' + Math.random().toString(36).substr(2, 9));

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'text/plain') {
        setResumeFile(file);
      } else {
        alert('Please upload a PDF or TXT file');
      }
    }
  };

  const uploadResume = async () => {
    if (!resumeFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('userId', userId);

      const response = await aiService.uploadResume(formData);
      
      setSession({
        sessionId: response.sessionId,
        currentQuestion: response.firstQuestion,
        questionNumber: 1,
        answers: [],
        scores: [],
        feedback: [],
        isComplete: false
      });
      
      setResumePreview(response.resumeText);
      setStep('interview');
    } catch (error) {
      console.error('Resume upload failed:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const submitAnswer = async () => {
    if (!session || !currentAnswer.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await aiService.submitInterviewAnswer({
        sessionId: session.sessionId,
        answer: currentAnswer,
        questionNumber: session.questionNumber,
        userId
      });

      const updatedSession: InterviewSession = {
        ...session,
        answers: [...session.answers, currentAnswer],
        scores: [...session.scores, response.score],
        feedback: [...session.feedback, response.feedback],
        questionNumber: response.questionNumber,
        currentQuestion: response.nextQuestion || '',
        isComplete: response.isComplete,
        overallScore: response.overallScore
      };

      setSession(updatedSession);
      setCurrentAnswer('');

      if (response.isComplete) {
        setStep('results');
      }
    } catch (error) {
      console.error('Answer submission failed:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startNewInterview = () => {
    setStep('upload');
    setResumeFile(null);
    setResumePreview('');
    setSession(null);
    setCurrentAnswer('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (step === 'upload') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Interview Coach
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your resume and practice with AI-powered interview questions tailored to your experience
          </p>
        </div>

        <div className="card p-8 max-w-2xl mx-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upload Your Resume
              </h3>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                {resumeFile ? (
                  <div className="space-y-4">
                    <FileText className="h-12 w-12 text-green-600 mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {resumeFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => setResumeFile(null)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Choose a file or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF or TXT files only (max 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      Select File
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                What to expect:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• AI will analyze your resume and generate relevant questions</li>
                <li>• 5 progressive questions tailored to your experience</li>
                <li>• Real-time scoring and detailed feedback</li>
                <li>• Constructive suggestions for improvement</li>
              </ul>
            </div>

            <button
              onClick={uploadResume}
              disabled={!resumeFile || isUploading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing Resume...</span>
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  <span>Start AI Interview</span>
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'interview' && session) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Interview Session
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Question {session.questionNumber} of 5
              </div>
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(session.questionNumber / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {session.scores.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full ${
                    i < session.scores.length
                      ? session.scores[i] >= 7
                        ? 'bg-green-500'
                        : session.scores[i] >= 5
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                ></div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-start space-x-4 mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Interview Question #{session.questionNumber}
                  </h3>
                  <div className="prose prose-sm dark:prose-invert">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {session.currentQuestion}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Your Answer
              </h3>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {currentAnswer.length} characters
                </div>
                <button
                  onClick={submitAnswer}
                  disabled={!currentAnswer.trim() || isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Answer</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Resume Preview
              </h3>
              <div className="text-xs text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
                {resumePreview}
              </div>
            </div>

            {session.scores.length > 0 && (
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Previous Scores
                </h3>
                <div className="space-y-2">
                  {session.scores.map((score, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Q{index + 1}
                      </span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
                        {score}/10
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results' && session) {
    const averageScore = session.scores.reduce((a, b) => a + b, 0) / session.scores.length;
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Interview Complete!
            </h1>
          </div>
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {averageScore.toFixed(1)}/10
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Overall Performance Score
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Question Breakdown
            </h3>
            <div className="space-y-4">
              {session.scores.map((score, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Question {index + 1}
                    </span>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
                      {score}/10
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {session.answers[index]?.substring(0, 100)}...
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              AI Feedback Summary
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {session.feedback.map((feedback, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium text-blue-600 mb-1">
                    Question {index + 1} Feedback:
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {feedback}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={startNewInterview}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
          >
            <Brain className="h-5 w-5" />
            <span>Start New Interview</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
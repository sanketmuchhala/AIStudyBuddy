import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  BookOpen, 
  FileQuestion, 
  BrainCircuit, 
  Download, 
  Copy,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

type Tool = 'flashcards' | 'quiz' | 'explainer';

interface FlashcardDeck {
  cards: Array<{ question: string; answer: string }>;
  topic: string;
  count: number;
}

interface Quiz {
  questions: Array<{
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }>;
  topic: string;
  difficulty: string;
}

export function StudyToolsPage() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const { toast } = useToast();

  const tools = [
    {
      id: 'flashcards' as Tool,
      title: 'Flashcard Generator',
      description: 'Create flashcards from any text or topic',
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      id: 'quiz' as Tool,
      title: 'Quiz Maker',
      description: 'Generate multiple-choice quizzes on any topic',
      icon: FileQuestion,
      color: 'bg-green-500',
    },
    {
      id: 'explainer' as Tool,
      title: 'Topic Explainer',
      description: 'Get detailed explanations of complex concepts',
      icon: BrainCircuit,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Study Tools</h1>
        <p className="text-muted-foreground">
          AI-powered tools to enhance your learning experience
        </p>
      </div>

      {/* Tool Selection */}
      {!activeTool && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card 
                key={tool.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                onClick={() => setActiveTool(tool.id)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${tool.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Get Started</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Active Tool */}
      {activeTool && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {(() => {
                const tool = tools.find(t => t.id === activeTool);
                const Icon = tool?.icon || BookOpen;
                return (
                  <>
                    <div className={`p-2 rounded-lg ${tool?.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{tool?.title}</h2>
                      <p className="text-muted-foreground">{tool?.description}</p>
                    </div>
                  </>
                );
              })()}
            </div>
            <Button variant="outline" onClick={() => setActiveTool(null)}>
              Back to Tools
            </Button>
          </div>

          {activeTool === 'flashcards' && <FlashcardTool />}
          {activeTool === 'quiz' && <QuizTool />}
          {activeTool === 'explainer' && <ExplainerTool />}
        </div>
      )}
    </div>
  );
}

function FlashcardTool() {
  const [content, setContent] = useState('');
  const [count, setCount] = useState(10);
  const [result, setResult] = useState<FlashcardDeck | null>(null);
  const { toast } = useToast();

  const generateFlashcards = useMutation({
    mutationFn: async () => {
      if (!content.trim()) {
        throw new Error('Please provide content to generate flashcards from');
      }
      const response = await apiClient.generateFlashcards(content, count);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.flashcards) {
        try {
          const parsed = JSON.parse(data.flashcards);
          setResult(parsed);
        } catch {
          // If not JSON, treat as structured text
          setResult({
            cards: [{ question: 'Generated Content', answer: data.flashcards }],
            topic: 'Custom',
            count: 1
          });
        }
        toast({
          title: 'Flashcards Generated!',
          description: `Created ${count} flashcards successfully.`,
        });
      }
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const downloadFlashcards = () => {
    if (!result) return;
    
    const csvContent = [
      'Question,Answer',
      ...result.cards.map(card => `"${card.question}","${card.answer}"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Flashcards</CardTitle>
          <CardDescription>
            Paste your study material and we'll create flashcards for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="content">Study Content</Label>
            <Textarea
              id="content"
              placeholder="Paste your study material here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
          <div>
            <Label htmlFor="count">Number of Flashcards</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 10)}
            />
          </div>
          <Button 
            onClick={() => generateFlashcards.mutate()}
            disabled={generateFlashcards.isPending || !content.trim()}
            className="w-full"
          >
            {generateFlashcards.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Flashcards
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Flashcards</CardTitle>
                <CardDescription>
                  {result.cards.length} flashcards generated
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={downloadFlashcards}>
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {result.cards.slice(0, 6).map((card, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="font-semibold text-sm text-muted-foreground">Question</div>
                    <div className="text-sm">{card.question}</div>
                    <div className="font-semibold text-sm text-muted-foreground">Answer</div>
                    <div className="text-sm">{card.answer}</div>
                  </div>
                </Card>
              ))}
            </div>
            {result.cards.length > 6 && (
              <div className="mt-4 text-center text-muted-foreground">
                And {result.cards.length - 6} more flashcards...
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function QuizTool() {
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [result, setResult] = useState<Quiz | null>(null);
  const { toast } = useToast();

  const generateQuiz = useMutation({
    mutationFn: async () => {
      if (!topic.trim()) {
        throw new Error('Please provide a topic for the quiz');
      }
      const response = await apiClient.generateQuiz(topic, questionCount, difficulty);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.quiz) {
        try {
          const parsed = JSON.parse(data.quiz);
          setResult(parsed);
        } catch {
          // Handle plain text response
          setResult({
            questions: [{ 
              question: data.quiz, 
              options: ['A', 'B', 'C', 'D'], 
              correct: 0, 
              explanation: 'Generated content' 
            }],
            topic: topic,
            difficulty: difficulty
          });
        }
        toast({
          title: 'Quiz Generated!',
          description: `Created a ${questionCount}-question quiz on ${topic}.`,
        });
      }
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Quiz</CardTitle>
          <CardDescription>
            Create a multiple-choice quiz on any topic
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., World War II, Calculus, Biology..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="questionCount">Number of Questions</Label>
              <Input
                id="questionCount"
                type="number"
                min="1"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <Button 
            onClick={() => generateQuiz.mutate()}
            disabled={generateQuiz.isPending || !topic.trim()}
            className="w-full"
          >
            {generateQuiz.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Quiz
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Your Quiz: {result.topic}</CardTitle>
            <CardDescription>
              <Badge variant="secondary">{result.difficulty}</Badge>
              <span className="ml-2">{result.questions.length} questions</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {result.questions.map((question, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="font-semibold">
                      {index + 1}. {question.question}
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div 
                          key={optIndex}
                          className={`p-2 rounded border ${
                            optIndex === question.correct 
                              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                              : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {optIndex === question.correct && (
                            <CheckCircle className="inline ml-2 h-4 w-4 text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ExplainerTool() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'simple' | 'detailed' | 'expert'>('detailed');
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const explainTopic = useMutation({
    mutationFn: async () => {
      if (!topic.trim()) {
        throw new Error('Please provide a topic to explain');
      }
      const response = await apiClient.explainTopic(topic, level);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.explanation) {
        setResult(data.explanation);
        toast({
          title: 'Explanation Generated!',
          description: `Created a ${level} explanation of ${topic}.`,
        });
      }
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast({
        title: 'Copied!',
        description: 'Explanation copied to clipboard.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Topic Explainer</CardTitle>
          <CardDescription>
            Get detailed explanations of complex concepts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topic">Topic or Concept</Label>
            <Input
              id="topic"
              placeholder="e.g., Quantum mechanics, Machine learning, Photosynthesis..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="level">Explanation Level</Label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value as 'simple' | 'detailed' | 'expert')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="simple">Simple - Easy to understand</option>
              <option value="detailed">Detailed - Comprehensive explanation</option>
              <option value="expert">Expert - Technical and in-depth</option>
            </select>
          </div>
          <Button 
            onClick={() => explainTopic.mutate()}
            disabled={explainTopic.isPending || !topic.trim()}
            className="w-full"
          >
            {explainTopic.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Explanation
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Explanation: {topic}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary">{level} level</Badge>
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap">{result}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
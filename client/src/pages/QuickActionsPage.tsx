import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  FileText, 
  Calendar, 
  Brain, 
  MessageSquare, 
  Target,
  Loader2,
  Copy,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ActionCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
}

const actions: ActionCard[] = [
  {
    id: 'summarize',
    title: 'Summarize Content',
    description: 'Get concise summaries of text, URLs, or documents',
    icon: FileText,
    color: 'text-blue-500',
  },
  {
    id: 'study-plan',
    title: '7-Day Study Plan',
    description: 'Create personalized study schedules for any topic',
    icon: Calendar,
    color: 'text-green-500',
  },
  {
    id: 'flashcards',
    title: 'Generate Flashcards',
    description: 'Create flashcards from your study material',
    icon: Brain,
    color: 'text-purple-500',
  },
  {
    id: 'explain',
    title: 'Topic Explainer',
    description: 'Get detailed explanations of complex topics',
    icon: MessageSquare,
    color: 'text-orange-500',
  },
  {
    id: 'quiz',
    title: 'Quiz Maker',
    description: 'Generate practice quizzes to test your knowledge',
    icon: Target,
    color: 'text-red-500',
  },
];

export function QuickActionsPage() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const executeAction = useMutation({
    mutationFn: async ({ actionId, data }: { actionId: string; data: any }) => {
      switch (actionId) {
        case 'summarize':
          return apiClient.summarizeContent(data.content, data.type);
        case 'study-plan':
          return apiClient.generateStudyPlan(data.topic, data.duration, data.level);
        case 'flashcards':
          return apiClient.generateFlashcards(data.content, data.count);
        case 'explain':
          return apiClient.explainTopic(data.topic, data.level);
        case 'quiz':
          return apiClient.generateQuiz(data.topic, data.questionCount, data.difficulty);
        default:
          throw new Error('Unknown action');
      }
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        const data = response.data as any;
        const resultText = 
          data.summary ||
          data.studyPlan ||
          data.flashcards ||
          data.explanation ||
          data.quiz ||
          'Result generated successfully';
        
        setResult(resultText);
        toast({
          title: 'Success!',
          description: 'Your request has been processed.',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
    setFormData({});
    setResult(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAction) return;
    
    executeAction.mutate({ actionId: selectedAction, data: formData });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'Result copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy text',
        variant: 'destructive',
      });
    }
  };

  const downloadAsText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderForm = () => {
    if (!selectedAction) return null;

    const action = actions.find(a => a.id === selectedAction);
    if (!action) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <action.icon className={`h-5 w-5 ${action.color}`} />
            {action.title}
          </CardTitle>
          <CardDescription>{action.description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedAction === 'summarize' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Content to summarize</label>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full h-32 px-3 py-2 border border-input bg-background rounded-md"
                    placeholder="Paste your text here..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content type</label>
                  <select
                    value={formData.type || 'text'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="text">Text</option>
                    <option value="url">URL</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>
            )}

            {selectedAction === 'study-plan' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Topic</label>
                  <input
                    type="text"
                    value={formData.topic || ''}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    placeholder="e.g., Machine Learning Basics"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (days)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.duration || 7}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Level</label>
                  <select
                    value={formData.level || 'intermediate'}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            )}

            {selectedAction === 'flashcards' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Study material</label>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full h-32 px-3 py-2 border border-input bg-background rounded-md"
                    placeholder="Paste your study material here..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Number of flashcards</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.count || 10}
                    onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  />
                </div>
              </div>
            )}

            {selectedAction === 'explain' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Topic to explain</label>
                  <input
                    type="text"
                    value={formData.topic || ''}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    placeholder="e.g., Quantum mechanics"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Explanation level</label>
                  <select
                    value={formData.level || 'detailed'}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="simple">Simple</option>
                    <option value="detailed">Detailed</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
            )}

            {selectedAction === 'quiz' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Topic</label>
                  <input
                    type="text"
                    value={formData.topic || ''}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    placeholder="e.g., World War II"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Number of questions</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.questionCount || 5}
                    onChange={(e) => setFormData({ ...formData, questionCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty || 'medium'}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={executeAction.isPending}
                className="flex-1"
              >
                {executeAction.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `Generate ${action.title}`
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setSelectedAction(null)}
              >
                Back
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  if (selectedAction && !result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Quick Actions</h1>
          <p className="text-muted-foreground">
            AI-powered tools to supercharge your learning
          </p>
        </div>
        
        {renderForm()}
      </div>
    );
  }

  if (result) {
    const action = actions.find(a => a.id === selectedAction);
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Result</h1>
          <p className="text-muted-foreground">
            Your {action?.title.toLowerCase()} has been generated
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {action && <action.icon className={`h-5 w-5 ${action.color}`} />}
                {action?.title} Result
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(result)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadAsText(result, `${selectedAction}-result.txt`)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
                {result}
              </pre>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={() => setResult(null)}>
            Create Another {action?.title}
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setSelectedAction(null);
              setResult(null);
            }}
          >
            Back to Actions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Quick Actions</h1>
        <p className="text-muted-foreground">
          AI-powered tools to supercharge your learning. Choose an action to get started.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card 
              key={action.id}
              className="transition-all hover:shadow-lg hover:scale-105 cursor-pointer"
              onClick={() => handleActionSelect(action.id)}
            >
              <CardHeader>
                <div className="space-y-2">
                  <Icon className={`h-8 w-8 ${action.color}`} />
                  <CardTitle>{action.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{action.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
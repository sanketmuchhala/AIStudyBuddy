'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'

interface Question {
  id: string
  question: string
  type: string
  difficulty: string
  suggestedAnswer?: string
  starFramework?: string
}

export default function InterviewPage() {
  const [activeTab, setActiveTab] = useState('setup')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'mid' | 'senior'>('mid')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPracticing, setIsPracticing] = useState(false)
  const [practiceTimer, setPracticeTimer] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
      toast.error('Please upload a PDF or text file')
      return
    }

    setUploadedFile(file)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/interview/parse-resume', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to parse resume')
      }

      const data = await response.json()
      setResumeText(data.text)
      toast.success('Resume uploaded and parsed successfully!')
    } catch (error) {
      console.error('Error parsing resume:', error)
      toast.error('Failed to parse resume. Please try again.')
    }
  }

  const generateQuestions = async () => {
    if (!role.trim()) {
      toast.error('Please enter a role')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/interview/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role,
          company,
          resumeText,
          experienceLevel,
          questionCount: 10
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate questions')
      }

      const data = await response.json()
      setQuestions(data.questions)
      setActiveTab('questions')
      toast.success(`Generated ${data.generatedCount} interview questions!`)
    } catch (error) {
      console.error('Error generating questions:', error)
      toast.error('Failed to generate questions. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const startPractice = () => {
    setActiveTab('practice')
    setCurrentQuestionIndex(0)
    setIsPracticing(true)
    setPracticeTimer(0)
    
    const interval = setInterval(() => {
      setPracticeTimer(prev => prev + 1)
    }, 1000)
    setTimerInterval(interval)
  }

  const stopPractice = () => {
    setIsPracticing(false)
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setPracticeTimer(0)
    } else {
      stopPractice()
      toast.success('Practice session completed!')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Interview Preparation</h1>
        <p className="text-muted-foreground">Prepare for your next job interview with AI-generated questions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="questions" disabled={questions.length === 0}>Questions</TabsTrigger>
          <TabsTrigger value="practice" disabled={questions.length === 0}>Practice</TabsTrigger>
          <TabsTrigger value="results" disabled={!isPracticing && practiceTimer === 0}>Results</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Resume Upload</span>
                </CardTitle>
                <CardDescription>
                  Upload your resume to get personalized interview questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {uploadedFile ? uploadedFile.name : 'Click to upload resume'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PDF or TXT files only
                    </span>
                  </label>
                </div>
                {resumeText && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Extracted text preview:</p>
                    <p className="text-sm line-clamp-3">{resumeText}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interview Details</CardTitle>
                <CardDescription>
                  Tell us about the position you're interviewing for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    placeholder="e.g. Frontend Developer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company (optional)</Label>
                  <Input
                    id="company"
                    placeholder="e.g. Google"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select value={experienceLevel} onValueChange={(value: string) => setExperienceLevel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                      <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateQuestions} 
                  className="w-full" 
                  disabled={isGenerating || !role.trim()}
                >
                  {isGenerating ? 'Generating...' : 'Generate Questions'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Generated Questions</h3>
              <p className="text-muted-foreground">{questions.length} questions ready for practice</p>
            </div>
            <Button onClick={startPractice}>
              <Play className="h-4 w-4 mr-2" />
              Start Practice
            </Button>
          </div>

          <div className="grid gap-4">
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">
                        Question {index + 1}
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Badge variant={question.type === 'technical' ? 'default' : question.type === 'behavioral' ? 'secondary' : 'outline'}>
                          {question.type}
                        </Badge>
                        <Badge variant="outline">{question.difficulty}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium mb-2">{question.question}</p>
                    {question.suggestedAnswer && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                          View suggested answer
                        </summary>
                        <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                          {question.suggestedAnswer}
                        </p>
                      </details>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          {questions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Practice Session</CardTitle>
                    <CardDescription>
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-mono">{formatTime(practiceTimer)}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isPracticing ? stopPractice : startPractice}
                    >
                      {isPracticing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="mt-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">
                    {questions[currentQuestionIndex]?.question}
                  </h3>
                  <div className="flex space-x-2">
                    <Badge>{questions[currentQuestionIndex]?.type}</Badge>
                    <Badge variant="outline">{questions[currentQuestionIndex]?.difficulty}</Badge>
                  </div>
                </div>

                <Textarea
                  placeholder="Practice your answer here..."
                  className="min-h-[200px]"
                />

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={nextQuestion}
                    disabled={!isPracticing}
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Practice Session Complete!</CardTitle>
              <CardDescription>
                Great job! Here's a summary of your practice session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{questions.length}</div>
                  <div className="text-sm text-muted-foreground">Questions Practiced</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatTime(practiceTimer)}</div>
                  <div className="text-sm text-muted-foreground">Total Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {questions.length > 0 ? Math.round(practiceTimer / questions.length) : 0}s
                  </div>
                  <div className="text-sm text-muted-foreground">Avg. per Question</div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={() => setActiveTab('setup')} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Practice Again
                </Button>
                <Button onClick={() => setActiveTab('questions')}>
                  Review Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
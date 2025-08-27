'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Clock,
  Coffee,
  BookOpen,
  Target,
  Calendar,
  TrendingUp,
  Volume2,
  VolumeX
} from 'lucide-react'
import { useStudyStore } from '@/lib/store'
import { useStudyTimerShortcuts } from '@/lib/keyboard-shortcuts'
import { toast } from 'sonner'

const POMODORO_TIME = 25 * 60 // 25 minutes in seconds
const SHORT_BREAK = 5 * 60    // 5 minutes in seconds  
const LONG_BREAK = 15 * 60    // 15 minutes in seconds

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak'
type TimerState = 'idle' | 'running' | 'paused'

export default function StudyPage() {
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro')
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [currentSubject, setCurrentSubject] = useState('')
  const [studyNotes, setStudyNotes] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [customDuration, setCustomDuration] = useState(25)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { addStudyTime, updateStreak } = useStudyStore()

  // Add keyboard shortcuts for timer control
  useStudyTimerShortcuts(
    () => timerState === 'idle' ? startTimer() : timerState === 'running' ? pauseTimer() : startTimer(),
    stopTimer,
    resetTimer
  )

  const getInitialTime = (mode: TimerMode) => {
    switch (mode) {
      case 'pomodoro': return customDuration * 60
      case 'shortBreak': return SHORT_BREAK
      case 'longBreak': return LONG_BREAK
    }
  }

  useEffect(() => {
    setTimeLeft(getInitialTime(timerMode))
  }, [timerMode, customDuration])

  useEffect(() => {
    if (timerState === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState, timeLeft])

  const handleTimerComplete = () => {
    setTimerState('idle')
    
    if (soundEnabled) {
      // Play notification sound (you could use Web Audio API here)
      // For now, just show a notification
    }

    if (timerMode === 'pomodoro') {
      setCompletedPomodoros(prev => prev + 1)
      addStudyTime(customDuration)
      updateStreak()
      
      toast.success('Pomodoro completed! Great work! 🍅', {
        description: 'Time for a break!'
      })

      // Auto-switch to break
      const nextMode = completedPomodoros > 0 && (completedPomodoros + 1) % 4 === 0 
        ? 'longBreak' 
        : 'shortBreak'
      setTimerMode(nextMode)
    } else {
      toast.success('Break time over! Ready to focus again? 💪')
      setTimerMode('pomodoro')
    }
  }

  const startTimer = () => {
    setTimerState('running')
    if (timerMode === 'pomodoro' && currentSubject) {
      toast.success(`Starting ${customDuration}-minute focus session: ${currentSubject}`)
    }
  }

  const pauseTimer = () => {
    setTimerState('paused')
  }

  const stopTimer = () => {
    setTimerState('idle')
    setTimeLeft(getInitialTime(timerMode))
  }

  const resetTimer = () => {
    setTimerState('idle')
    setTimeLeft(getInitialTime(timerMode))
    setCompletedPomodoros(0)
    setStudyNotes('')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    const totalTime = getInitialTime(timerMode)
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const getModeIcon = (mode: TimerMode) => {
    switch (mode) {
      case 'pomodoro': return <BookOpen className="h-4 w-4" />
      case 'shortBreak': return <Coffee className="h-4 w-4" />
      case 'longBreak': return <Coffee className="h-4 w-4" />
    }
  }

  const getModeColor = (mode: TimerMode) => {
    switch (mode) {
      case 'pomodoro': return 'bg-red-500'
      case 'shortBreak': return 'bg-green-500'
      case 'longBreak': return 'bg-blue-500'
    }
  }

  const studyPlan = [
    { time: '9:00 AM', subject: 'Mathematics', duration: '2 hours', status: 'completed' },
    { time: '11:30 AM', subject: 'Physics', duration: '1.5 hours', status: 'current' },
    { time: '2:00 PM', subject: 'Chemistry', duration: '1 hour', status: 'pending' },
    { time: '4:00 PM', subject: 'English', duration: '1 hour', status: 'pending' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Study Session</h1>
        <p className="text-muted-foreground">Focus with the Pomodoro Technique and track your progress</p>
      </div>

      <Tabs defaultValue="timer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="plan">Study Plan</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="text-center">
                <CardHeader>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className={`p-2 rounded-full ${getModeColor(timerMode)} text-white`}>
                      {getModeIcon(timerMode)}
                    </div>
                    <div>
                      <CardTitle>
                        {timerMode === 'pomodoro' ? 'Focus Time' : 
                         timerMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                      </CardTitle>
                      <CardDescription>
                        {timerMode === 'pomodoro' ? 'Time to focus and be productive' :
                         'Take a break and recharge'}
                      </CardDescription>
                    </div>
                  </div>

                  {timerMode === 'pomodoro' && (
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Badge variant="outline">
                        Session {completedPomodoros + 1}
                      </Badge>
                      {completedPomodoros > 0 && (
                        <Badge variant="secondary">
                          {completedPomodoros} completed today
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  <motion.div
                    key={timerMode}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl font-mono font-bold"
                  >
                    {formatTime(timeLeft)}
                  </motion.div>

                  <Progress 
                    value={getProgress()} 
                    className="w-full max-w-md mx-auto"
                  />

                  <div className="flex justify-center space-x-4">
                    {timerState === 'idle' ? (
                      <Button onClick={startTimer} size="lg">
                        <Play className="h-5 w-5 mr-2" />
                        Start
                      </Button>
                    ) : timerState === 'running' ? (
                      <Button onClick={pauseTimer} size="lg" variant="outline">
                        <Pause className="h-5 w-5 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button onClick={startTimer} size="lg">
                        <Play className="h-5 w-5 mr-2" />
                        Resume
                      </Button>
                    )}
                    
                    <Button onClick={stopTimer} size="lg" variant="destructive">
                      <Square className="h-5 w-5 mr-2" />
                      Stop
                    </Button>

                    <Button onClick={() => setSoundEnabled(!soundEnabled)} size="lg" variant="ghost">
                      {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                    </Button>
                  </div>

                  <div className="flex justify-center space-x-2">
                    <Button 
                      variant={timerMode === 'pomodoro' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimerMode('pomodoro')}
                      disabled={timerState === 'running'}
                    >
                      Focus
                    </Button>
                    <Button 
                      variant={timerMode === 'shortBreak' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimerMode('shortBreak')}
                      disabled={timerState === 'running'}
                    >
                      Short Break
                    </Button>
                    <Button 
                      variant={timerMode === 'longBreak' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimerMode('longBreak')}
                      disabled={timerState === 'running'}
                    >
                      Long Break
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Session Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Focus Duration (minutes)</Label>
                    <Select
                      value={customDuration.toString()}
                      onValueChange={(value) => setCustomDuration(parseInt(value))}
                      disabled={timerState === 'running'}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="25">25 minutes (Classic)</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Current Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What are you studying?"
                      value={currentSubject}
                      onChange={(e) => setCurrentSubject(e.target.value)}
                    />
                  </div>

                  <Button onClick={resetTimer} variant="outline" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Session
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Study Notes</CardTitle>
                  <CardDescription>
                    Jot down key points during your study session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="What did you learn today?"
                    value={studyNotes}
                    onChange={(e) => setStudyNotes(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Study Plan</CardTitle>
              <CardDescription>
                Your planned study sessions for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studyPlan.map((session, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-lg border">
                    <div className={`p-2 rounded-full ${
                      session.status === 'completed' ? 'bg-green-500' :
                      session.status === 'current' ? 'bg-blue-500' :
                      'bg-gray-300'
                    } text-white`}>
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{session.subject}</h3>
                        <Badge variant={
                          session.status === 'completed' ? 'default' :
                          session.status === 'current' ? 'default' :
                          'secondary'
                        }>
                          {session.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.time} • {session.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Today's Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedPomodoros}</div>
                <p className="text-xs text-muted-foreground">
                  {completedPomodoros * customDuration} minutes total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Weekly Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6.2</div>
                <p className="text-xs text-muted-foreground">sessions per day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Focus Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">days in a row</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Productivity Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">this week</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-12 text-sm font-medium">{day}</div>
                    <Progress value={Math.random() * 100} className="flex-1" />
                    <div className="w-16 text-sm text-muted-foreground text-right">
                      {Math.floor(Math.random() * 8)} sessions
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
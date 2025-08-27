'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Moon, 
  Sun, 
  Monitor,
  Download,
  Trash2,
  Bell,
  Volume2,
  Eye,
  Keyboard,
  Database,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoBreak, setAutoBreak] = useState(false)
  const [pomodoroLength, setPomodoroLength] = useState('25')
  const [shortBreakLength, setShortBreakLength] = useState('5')
  const [longBreakLength, setLongBreakLength] = useState('15')
  const [dailyGoal, setDailyGoal] = useState('8')

  const exportData = async () => {
    try {
      // In a real app, you'd fetch all user data from the API
      const userData = {
        exportDate: new Date().toISOString(),
        studySessions: [],
        flashcards: [],
        chatHistory: [],
        interviewSessions: [],
        settings: {
          theme,
          notifications,
          soundEnabled,
          pomodoroLength,
          dailyGoal
        }
      }

      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-study-buddy-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Data exported successfully!')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const clearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        // In a real app, you'd make API calls to clear data
        localStorage.clear()
        toast.success('All data cleared successfully!')
      } catch (error) {
        toast.error('Failed to clear data')
      }
    }
  }

  const testApiConnection = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Test connection',
          sessionId: null
        })
      })

      if (response.ok) {
        toast.success('API connection successful!')
      } else {
        toast.error('API connection failed')
      }
    } catch (error) {
      toast.error('Failed to test API connection')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Customize your AI Study Buddy experience</p>
      </div>

      <div className="grid gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your study environment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred color scheme
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Keyboard className="h-5 w-5" />
              <span>Study Settings</span>
            </CardTitle>
            <CardDescription>
              Configure your study sessions and goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Pomodoro Length</Label>
                <Select value={pomodoroLength} onValueChange={setPomodoroLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="25">25 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Daily Study Goal</Label>
                <Select value={dailyGoal} onValueChange={setDailyGoal}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 sessions</SelectItem>
                    <SelectItem value="6">6 sessions</SelectItem>
                    <SelectItem value="8">8 sessions</SelectItem>
                    <SelectItem value="10">10 sessions</SelectItem>
                    <SelectItem value="12">12 sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Short Break</Label>
                <Select value={shortBreakLength} onValueChange={setShortBreakLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 minutes</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Long Break</Label>
                <Select value={longBreakLength} onValueChange={setLongBreakLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Auto-start breaks</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically start break timers after study sessions
                </p>
              </div>
              <Switch checked={autoBreak} onCheckedChange={setAutoBreak} />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Manage how you receive notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about study reminders and achievements
                </p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Sound Effects</Label>
                <p className="text-sm text-muted-foreground">
                  Play sounds for timer notifications and achievements
                </p>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
          </CardContent>
        </Card>

        {/* AI & API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>AI & API</span>
            </CardTitle>
            <CardDescription>
              Manage your AI features and API connections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>API Status</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-500">Connected</Badge>
                  <span className="text-sm text-muted-foreground">DeepSeek API</span>
                </div>
              </div>
              <Button variant="outline" onClick={testApiConnection}>
                Test Connection
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-medium">AI Features Enabled</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Chat Assistant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Interview Questions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Study Recommendations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Smart Scheduling</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data & Privacy</span>
            </CardTitle>
            <CardDescription>
              Manage your data, privacy, and export options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download all your study data, progress, and settings
                </p>
              </div>
              <Button variant="outline" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-destructive">Clear All Data</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all your data. This action cannot be undone.
                </p>
              </div>
              <Button variant="destructive" onClick={clearAllData}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle>Keyboard Shortcuts</CardTitle>
            <CardDescription>
              Speed up your workflow with these keyboard shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Send chat message</span>
                <Badge variant="outline">Cmd/Ctrl + Enter</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Start/pause timer</span>
                <Badge variant="outline">Space</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Grade flashcard Easy</span>
                <Badge variant="outline">4</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Grade flashcard Good</span>
                <Badge variant="outline">3</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Grade flashcard Hard</span>
                <Badge variant="outline">2</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Grade flashcard Again</span>
                <Badge variant="outline">1</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
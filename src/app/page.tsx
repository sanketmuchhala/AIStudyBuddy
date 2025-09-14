'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  MessageCircle,
  Users,
  BookOpen,
  CreditCard,
  Clock,
  TrendingUp,
  Trophy
} from 'lucide-react'

export default function Dashboard() {
  const [streakData, setStreakData] = useState({ current: 0, longest: 0 })
  const [studyStats, setStudyStats] = useState({ today: 0, week: 0, total: 0 })
  const [upcomingReviews, setUpcomingReviews] = useState(0)

  useEffect(() => {
    // Mock data for now - would fetch from API in production
    setStreakData({ current: 5, longest: 15 })
    setStudyStats({ today: 45, week: 180, total: 1250 })
    setUpcomingReviews(8)
  }, [])

  const quickActions = [
    {
      title: 'Start Chat Session',
      description: 'Get instant help from your AI tutor',
      icon: MessageCircle,
      href: '/chat',
      color: 'bg-blue-500'
    },
    {
      title: 'Practice Interview',
      description: 'Prepare for your next job interview',
      icon: Users,
      href: '/interview',
      color: 'bg-green-500'
    },
    {
      title: 'Review Flashcards',
      description: `${upcomingReviews} cards due for review`,
      icon: CreditCard,
      href: '/flashcards',
      color: 'bg-purple-500'
    },
    {
      title: 'Start Study Session',
      description: 'Focus with Pomodoro timer',
      icon: Clock,
      href: '/study',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your study overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streakData.current} days</div>
            <p className="text-xs text-muted-foreground">
              Best: {streakData.longest} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyStats.today} min</div>
            <p className="text-xs text-muted-foreground">
              +{studyStats.today}min from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyStats.week} min</div>
            <Progress value={75} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              75% of weekly goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Due</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingReviews}</div>
            <p className="text-xs text-muted-foreground">
              Ready for review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={action.href}>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <action.icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                    </div>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <BookOpen className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Completed 25-minute study session</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <Badge variant="secondary">+25 min</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Asked about React hooks</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
                <Badge variant="outline">Chat</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Reviewed 12 flashcards</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
                <Badge variant="secondary">+180 XP</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

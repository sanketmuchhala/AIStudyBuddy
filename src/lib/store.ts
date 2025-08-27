import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StudySession {
  id: string
  type: 'pomodoro' | 'deep' | 'review'
  duration: number
  subject: string
  startedAt: Date
  completed: boolean
}

interface StudyState {
  currentSession: StudySession | null
  totalStudyTime: number
  currentStreak: number
  longestStreak: number
  lastStudied: Date | null
  setCurrentSession: (session: StudySession | null) => void
  addStudyTime: (minutes: number) => void
  updateStreak: () => void
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      totalStudyTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastStudied: null,
      setCurrentSession: (session) => set({ currentSession: session }),
      addStudyTime: (minutes) => {
        const state = get()
        set({ 
          totalStudyTime: state.totalStudyTime + minutes,
          lastStudied: new Date()
        })
      },
      updateStreak: () => {
        const state = get()
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        
        if (state.lastStudied) {
          const lastStudiedDate = new Date(state.lastStudied).toDateString()
          const todayString = today.toDateString()
          const yesterdayString = yesterday.toDateString()
          
          if (lastStudiedDate === todayString) {
            // Already studied today, no change needed
            return
          } else if (lastStudiedDate === yesterdayString) {
            // Studied yesterday, increment streak
            const newStreak = state.currentStreak + 1
            set({
              currentStreak: newStreak,
              longestStreak: Math.max(state.longestStreak, newStreak),
              lastStudied: today
            })
          } else {
            // Streak broken, start over
            set({
              currentStreak: 1,
              longestStreak: Math.max(state.longestStreak, 1),
              lastStudied: today
            })
          }
        } else {
          // First time studying
          set({
            currentStreak: 1,
            longestStreak: 1,
            lastStudied: today
          })
        }
      }
    }),
    {
      name: 'study-storage'
    }
  )
)

interface ChatState {
  sessions: Array<{
    id: string
    title: string
    lastMessage: Date
  }>
  currentSessionId: string | null
  addSession: (session: { id: string; title: string }) => void
  setCurrentSession: (id: string | null) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      sessions: [],
      currentSessionId: null,
      addSession: (session) =>
        set((state) => ({
          sessions: [{ ...session, lastMessage: new Date() }, ...state.sessions]
        })),
      setCurrentSession: (id) => set({ currentSessionId: id })
    }),
    {
      name: 'chat-storage'
    }
  )
)
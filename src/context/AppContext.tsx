'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Goal, Task, Reminder, TimelineEvent } from '@/types'
import { toast } from '@/hooks/use-toast'

interface AppContextType {
  // Auth
  isAuthenticated: boolean
  currentUser: User | null
  setIsAuthenticated: (value: boolean) => void
  setCurrentUser: (user: User | null) => void
  
  // Data
  goals: Goal[]
  tasks: Task[]
  reminders: Reminder[]
  timelineEvents: TimelineEvent[]
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>
  setTimelineEvents: React.Dispatch<React.SetStateAction<TimelineEvent[]>>
  
  // Loading
  loadUserData: (userId: string) => Promise<void>
  addTimelineEvent: (type: string, title: string, description: string) => void
  checkReminders: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])

  // Load data from backend
  const loadUserData = async (userId: string) => {
    try {
      // Fetch goals
      const goalsRes = await fetch(`/api/goals?userId=${userId}`)
      if (goalsRes.ok) {
        const goalsData = await goalsRes.json()
        setGoals(goalsData.goals || [])
      }

      // Fetch tasks
      const tasksRes = await fetch(`/api/tasks?userId=${userId}`)
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(tasksData.tasks || [])
      }

      // Fetch reminders
      const remindersRes = await fetch(`/api/reminders?userId=${userId}`)
      if (remindersRes.ok) {
        const remindersData = await remindersRes.json()
        setReminders(remindersData.reminders || [])
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  // Timeline functions
  const addTimelineEvent = (type: string, title: string, description: string) => {
    const newEvent: TimelineEvent = {
      id: `timeline-${Date.now()}`,
      type,
      title,
      description,
      timestamp: new Date().toISOString()
    }
    setTimelineEvents([newEvent, ...timelineEvents])
  }

  // Check reminders
  const checkReminders = () => {
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0]
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    reminders.forEach(reminder => {
      if (!reminder.triggered && reminder.date === currentDate && reminder.time <= currentTime) {
        if (reminder.type === 'browser' || reminder.type === 'both') {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(reminder.title, {
              body: reminder.message || 'Time for your reminder!',
              icon: '/logo.svg'
            })
          }
          toast({
            title: reminder.title,
            description: reminder.message || 'Time for your reminder!',
          })
        }

        setReminders(prev =>
          prev.map(r => r.id === reminder.id ? { ...r, triggered: true } : r)
        )
      }
    })
  }

  // Initialize data
  useEffect(() => {
    const savedUser = localStorage.getItem('goalTracker_user')

    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      setIsAuthenticated(true)
      loadUserData(user.id)
    }

    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission()
    }

    // Check reminders every minute
    const reminderInterval = setInterval(checkReminders, 60000)
    return () => clearInterval(reminderInterval)
  }, [reminders])

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        setIsAuthenticated,
        setCurrentUser,
        goals,
        tasks,
        reminders,
        timelineEvents,
        setGoals,
        setTasks,
        setReminders,
        setTimelineEvents,
        loadUserData,
        addTimelineEvent,
        checkReminders,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}


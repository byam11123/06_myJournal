// Shared Types
export interface User {
  id: string
  username: string
  email: string
  name: string
  createdAt: string
}

export interface Goal {
  id: string
  title: string
  description: string | null
  category: string
  status: string
  targetDate: string | null
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  date: string
  time: string | null
  completed: boolean
  goalId: string
  goal?: {
    id: string
    title: string
  }
  createdAt: string
  updatedAt: string
  photos?: { id: string; url: string }[]
  learnings?: { id: string; content: string }[]
  notes?: { id: string; content: string }[]
}

export interface Reminder {
  id: string
  taskId: string | null
  title: string
  message: string | null
  date: string
  time: string
  type: string
  triggered: boolean
}

export interface TimelineEvent {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
}


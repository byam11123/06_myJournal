'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Target,
  CheckCircle2,
  Clock,
  GripVertical,
  Image as ImageIcon,
  Bell,
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Calendar,
  BarChart3,
  History,
  User,
  Upload,
  X,
  Lightbulb,
  StickyNote,
  ArrowRight,
  AlertTriangle,
  LayoutGrid,
  List,
  Sun,
  Circle
} from 'lucide-react'

// Types
interface User {
  id: string
  username: string
  email: string
  name: string
  createdAt: string
}

interface Goal {
  id: string
  title: string
  description: string | null
  category: string
  status: string
  targetDate: string | null
  createdAt: string
  updatedAt: string
}

interface Task {
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

interface Reminder {
  id: string
  taskId: string | null
  title: string
  message: string | null
  date: string
  time: string
  type: string
  triggered: boolean
}

interface TimelineEvent {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
}

export default function Home() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Auth form state
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  // Application data
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])

  // Modal states
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)

  // Form states
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Goal form
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDescription, setGoalDescription] = useState('')
  const [goalCategory, setGoalCategory] = useState('')
  const [goalStatus, setGoalStatus] = useState('Active')
  const [goalTargetDate, setGoalTargetDate] = useState('')

  // Task form
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskDate, setTaskDate] = useState('')
  const [taskTime, setTaskTime] = useState('')
  const [taskGoalId, setTaskGoalId] = useState('')

  // Reminder form
  const [reminderTitle, setReminderTitle] = useState('')
  const [reminderMessage, setReminderMessage] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [reminderType, setReminderType] = useState('browser')

  // Learning & Notes
  const [newLearning, setNewLearning] = useState('')
  const [newNote, setNewNote] = useState('')

  // Bulk import
  const [importData, setImportData] = useState('')
  const [importFormat, setImportFormat] = useState('json')

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  // Task view mode within Tasks tab
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'grid'>('list')
  const [taskSection, setTaskSection] = useState<'all' | 'today' | 'completed' | 'incomplete'>('all')
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<string | null>(null)

  // Initialize data
  useEffect(() => {
    const savedUser = localStorage.getItem('goalTracker_user')

    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      setIsAuthenticated(true)
      setActiveTab('goals')
      loadUserData(user.id)
    }

    // Check reminders every minute
    const reminderInterval = setInterval(checkReminders, 60000)
    return () => clearInterval(reminderInterval)

    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission()
    }
  }, [])

  // Active tab state for controlled tabs
  const [activeTab, setActiveTab] = useState('goals')

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
      console.error('Error loading data:', error)
    }
  }

  // Auth functions
  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      })
      return
    }

    try {
      // If demo user, initialize demo data first
      if (username === 'demo') {
        await fetch('/api/init-demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'demo' })
        })
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: 'Login failed',
          description: data.error || 'Invalid credentials',
          variant: 'destructive'
        })
        return
      }

      setCurrentUser(data.user)
      setIsAuthenticated(true)
      localStorage.setItem('goalTracker_user', JSON.stringify(data.user))
      loadUserData(data.user.id)
      setActiveTab('goals')
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in',
      })
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'An error occurred',
        variant: 'destructive'
      })
    }
  }

  const handleSignup = async () => {
    if (!username || !email || !name || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      })
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, name, password })
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: 'Signup failed',
          description: data.error || 'An error occurred',
          variant: 'destructive'
        })
        return
      }

      // Clear form
      setUsername('')
      setEmail('')
      setName('')
      setPassword('')

      // Show success message and switch to login
      toast({
        title: 'Account created successfully!',
        description: 'Please login with your credentials',
      })
      setShowSignup(false)
    } catch (error) {
      toast({
        title: 'Signup failed',
        description: 'An error occurred',
        variant: 'destructive'
      })
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    localStorage.removeItem('goalTracker_user')
    setGoals([])
    setTasks([])
    setReminders([])
    setTimelineEvents([])
    toast({ title: 'Logged out successfully' })
  }

  // Goal functions
  const handleSaveGoal = async () => {
    if (!goalTitle || !goalCategory) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive'
      })
      return
    }

    if (!currentUser) return

    try {
      if (editingGoal) {
        const res = await fetch(`/api/goals/${editingGoal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: goalTitle,
            description: goalDescription,
            category: goalCategory,
            status: goalStatus,
            targetDate: goalTargetDate
          })
        })

        if (res.ok) {
          const data = await res.json()
          setGoals(goals.map(g => g.id === editingGoal.id ? data.goal : g))
          addTimelineEvent('goal_updated', 'Goal Updated', `You updated "${goalTitle}"`)
          toast({ title: 'Goal updated!' })
        }
      } else {
        const res = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            title: goalTitle,
            description: goalDescription,
            category: goalCategory,
            status: goalStatus,
            targetDate: goalTargetDate
          })
        })

        if (res.ok) {
          const data = await res.json()
          setGoals([...goals, data.goal])
          addTimelineEvent('goal_created', 'New Goal Created', `You set a goal to "${goalTitle}"`)
          toast({ title: 'Goal created!' })
        }
      }
      resetGoalForm()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save goal',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setGoals(goals.filter(g => g.id !== goalId))
        toast({ title: 'Goal deleted!' })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete goal',
        variant: 'destructive'
      })
    }
  }

  const resetGoalForm = () => {
    setEditingGoal(null)
    setGoalTitle('')
    setGoalDescription('')
    setGoalCategory('')
    setGoalStatus('Active')
    setGoalTargetDate('')
    setShowGoalDialog(false)
  }

  const resetTaskForm = () => {
    setEditingTask(null)
    setTaskTitle('')
    setTaskDescription('')
    setTaskDate('')
    setTaskTime('')
    setTaskGoalId('')
    setShowTaskDialog(false)
  }

  // Task functions
  const handleSaveTask = async () => {
    if (!taskTitle || !taskDate || !taskGoalId) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive'
      })
      return
    }

    if (!currentUser) return

    try {
      if (editingTask) {
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: taskTitle,
            description: taskDescription,
            date: taskDate,
            time: taskTime,
            goalId: taskGoalId
          })
        })

        if (res.ok) {
          const data = await res.json()
          setTasks(tasks.map(t => t.id === editingTask.id ? data.task : t))
          addTimelineEvent('task_updated', 'Task Updated', `You updated "${taskTitle}"`)
          toast({ title: 'Task updated!' })
        }
      } else {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            title: taskTitle,
            description: taskDescription,
            date: taskDate,
            time: taskTime,
            goalId: taskGoalId
          })
        })

        if (res.ok) {
          const data = await res.json()
          setTasks([...tasks, data.task])
          addTimelineEvent('task_created', 'Task Added', `You added "${taskTitle}"`)
          toast({ title: 'Task created!' })
        }
      }
      resetTaskForm()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save task',
        variant: 'destructive'
      })
    }
  }

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) {
      console.error('Task not found:', taskId)
      return
    }

    console.log('Toggling task:', taskId, 'Current completed:', task.completed)

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      })

      if (res.ok) {
        const data = await res.json()
        console.log('API response:', data.task)
        setTasks(tasks.map(t => t.id === taskId ? data.task : t))
        const newCompletedStatus = !task.completed; // This is the new status after toggle
        addTimelineEvent(
          newCompletedStatus ? 'task_completed' : 'task_uncompleted',
          newCompletedStatus ? 'Task Completed' : 'Task Uncompleted',
          `You ${newCompletedStatus ? 'completed' : 'uncompleted'} "${task.title}"`
        )
        toast({
          title: newCompletedStatus ? 'Task completed!' : 'Task uncompleted!',
          description: `"${task.title}" is now ${newCompletedStatus ? 'done' : 'pending'}`,
        })
      } else {
        console.error('API error:', res.status)
        toast({
          title: 'Error',
          description: 'Failed to update task',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Toggle error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== taskId))
        toast({ title: 'Task deleted!' })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive'
      })
    }
  }

  // Drag and drop functions
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId)
  }

  const handleDragEnd = async (taskId: string) => {
    if (!draggedTaskId || draggedTaskId === taskId) {
      setDraggedTaskId(null)
      return
    }

    try {
      // Swap tasks in array
      const taskIndex1 = tasks.findIndex(t => t.id === draggedTaskId)
      const taskIndex2 = tasks.findIndex(t => t.id === taskId)

      if (taskIndex1 === -1 || taskIndex2 === -1) {
        setDraggedTaskId(null)
        return
      }

      const newTasks = [...tasks]
      const [removed] = newTasks.splice(taskIndex1, 1)
      newTasks.splice(taskIndex2, 0, removed[0])

      setTasks(newTasks)
      setDraggedTaskId(null)
    } catch (error) {
      console.error('Failed to reorder tasks:', error)
      setDraggedTaskId(null)
    }
  }

  // Photo functions
  const handleAddPhoto = async (taskId: string) => {
    const colors = ['#4ade80', '#f472b6', '#60a5fa', '#fbbf24', '#a78bfa', '#34d399']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]

    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          url: randomColor
        })
      })

      if (res.ok) {
        const data = await res.json()
        setTasks(tasks.map(t =>
          t.id === taskId
            ? { ...t, photos: [...(t.photos || []), data.photo] }
            : t
        ))
        toast({ title: 'Photo added!' })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add photo',
        variant: 'destructive'
      })
    }
  }

  const handleRemovePhoto = async (taskId: string, photoId: string) => {
    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setTasks(tasks.map(t =>
          t.id === taskId
            ? { ...t, photos: (t.photos || []).filter(p => p.id !== photoId) }
            : t
        ))
        toast({ title: 'Photo removed!' })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove photo',
        variant: 'destructive'
      })
    }
  }

  // Learning & Notes functions
  const handleAddLearning = async (taskId: string) => {
    if (!newLearning.trim()) return

    try {
      const res = await fetch('/api/learnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          content: newLearning
        })
      })

      if (res.ok) {
        const data = await res.json()
        setTasks(tasks.map(t =>
          t.id === taskId
            ? { ...t, learnings: [...(t.learnings || []), data.learning] }
            : t
        ))
        setNewLearning('')
        toast({ title: 'Learning added!' })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add learning',
        variant: 'destructive'
      })
    }
  }

  const handleAddNote = async (taskId: string) => {
    if (!newNote.trim()) return

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          content: newNote
        })
      })

      if (res.ok) {
        const data = await res.json()
        setTasks(tasks.map(t =>
          t.id === taskId
            ? { ...t, notes: [...(t.notes || []), data.note] }
            : t
        ))
        setNewNote('')
        toast({ title: 'Note added!' })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive'
      })
    }
  }

  // Reminder functions
  const handleSaveReminder = async () => {
    if (!reminderTitle || !reminderDate || !reminderTime || !currentUser) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive'
      })
      return
    }

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: reminderTitle,
          message: reminderMessage,
          date: reminderDate,
          time: reminderTime,
          type: reminderType
        })
      })

      if (res.ok) {
        const data = await res.json()
        setReminders([...reminders, data.reminder])
        addTimelineEvent('reminder_created', 'Reminder Set', `You set a reminder for "${reminderTitle}"`)
        toast({ title: 'Reminder set!' })
      }

      setReminderTitle('')
      setReminderMessage('')
      setReminderDate('')
      setReminderTime('')
      setShowReminderDialog(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set reminder',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const res = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setReminders(reminders.filter(r => r.id !== reminderId))
        toast({ title: 'Reminder deleted!' })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete reminder',
        variant: 'destructive'
      })
    }
  }

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

  // Bulk import functions
  const handleBulkImport = () => {
    try {
      let importedTasks: any[] = []

      if (importFormat === 'json') {
        importedTasks = JSON.parse(importData)
      } else if (importFormat === 'csv') {
        const lines = importData.split('\n')
        const headers = lines[0].split(',').map(h => h.trim())
        importedTasks = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim())
          const task: any = {}
          headers.forEach((header, index) => {
            task[header] = values[index]
          })
          return task
        }).filter(task => task.title && task.date)
      }

      const newTasks = importedTasks.map((item: any) => {
        const goal = goals.find(g => g.title.toLowerCase().includes(item.goalTitle?.toLowerCase() || ''))
        return {
          id: `task-${Date.now()}-${Math.random()}`,
          title: item.title,
          description: item.description || null,
          date: item.date,
          time: item.time || null,
          completed: false,
          goalId: goal?.id || goals[0]?.id || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })

      setTasks([...tasks, ...newTasks])
      addTimelineEvent('bulk_import', 'Bulk Import', `You imported ${newTasks.length} tasks`)
      toast({
        title: 'Import successful!',
        description: `${newTasks.length} tasks imported`,
      })

      setImportData('')
      setShowBulkImport(false)
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'Please check your data format',
        variant: 'destructive'
      })
    }
  }

  // Analytics calculations
  const getAnalytics = () => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    const activeGoals = goals.filter(g => g.status === 'Active')
    const completedGoals = goals.filter(g => g.status === 'Completed')

    const todayTasks = tasks.filter(t => t.date === today)
    const todayCompletedTasks = todayTasks.filter(t => t.completed)

    const yesterdayTasks = tasks.filter(t => t.date === yesterday)
    const yesterdayCompletedTasks = yesterdayTasks.filter(t => t.completed)
    const yesterdayIncompleteTasks = yesterdayTasks.filter(t => !t.completed)

    const totalPhotos = tasks.reduce((sum, t) => sum + (t.photos?.length || 0), 0)

    const categoryBreakdown = goals.reduce((acc, goal) => {
      acc[goal.category] = (acc[goal.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalTasks: tasks.length,
      todayTasks: todayTasks.length,
      todayCompletedTasks: todayCompletedTasks.length,
      yesterdayCompletedTasks: yesterdayCompletedTasks.length,
      yesterdayIncompleteTasks: yesterdayIncompleteTasks.length,
      totalPhotos,
      categoryBreakdown
    }
  }

  const analytics = getAnalytics()

  // Calculate goal progress
  const getGoalProgress = (goalId: string) => {
    const goalTasks = tasks.filter(t => t.goalId === goalId)
    if (goalTasks.length === 0) return 0
    const completedTasks = goalTasks.filter(t => t.completed)
    return Math.round((completedTasks.length / goalTasks.length) * 100)
  }

  // Get filtered tasks based on section and goal filter
  const getFilteredTasks = () => {
    const today = new Date().toISOString().split('T')[0]

    // First apply section filter (all/today/completed/incomplete)
    let filtered = tasks
    switch (taskSection) {
      case 'today':
        filtered = tasks.filter(t => t.date === today)
        break
      case 'completed':
        filtered = tasks.filter(t => t.completed)
        break
      case 'incomplete':
        filtered = tasks.filter(t => !t.completed)
        break
      case 'all':
      default:
        break
    }

    // Then apply goal filter if active
    if (selectedGoalFilter) {
      filtered = filtered.filter(t => t.goalId === selectedGoalFilter)
    }

    return filtered
  }

  // Auth Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">myJournal</CardTitle>
            <CardDescription>
              {showSignup ? 'Create your account to get started' : 'Login to continue your journey'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {showSignup && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder={showSignup ? 'johndoe' : 'demo'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={showSignup ? '••••••' : 'demo123'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={showSignup ? handleSignup : handleLogin}
              >
                {showSignup ? 'Sign Up' : 'Login'}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                {showSignup ? (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => setShowSignup(false)}
                      className="text-primary hover:underline"
                    >
                      Login
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setShowSignup(true)}
                      className="text-primary hover:underline"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
              {!showSignup && (
                <div className="text-center text-xs text-muted-foreground bg-muted p-3 rounded">
                  <p className="font-medium mb-1">Demo Credentials:</p>
                  <p>Username: <code>demo</code></p>
                  <p>Password: <code>demo123</code></p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filtered tasks for display
  const filteredTasks = getFilteredTasks()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">myJournal</h1>
              <p className="text-sm text-muted-foreground">Hello, {currentUser?.name}!</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowProfile(true)}
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="goals" onClick={() => setActiveTab('goals')}>Goals</TabsTrigger>
            <TabsTrigger value="tasks" onClick={() => setActiveTab('tasks')}>Daily Tasks</TabsTrigger>
            <TabsTrigger value="revision" onClick={() => setActiveTab('revision')}>Revision</TabsTrigger>
            <TabsTrigger value="analytics" onClick={() => setActiveTab('analytics')}>Analytics</TabsTrigger>
            <TabsTrigger value="timeline" onClick={() => setActiveTab('timeline')}>Timeline</TabsTrigger>
            <TabsTrigger value="reminders" onClick={() => setActiveTab('reminders')}>Reminders</TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Your Goals</h2>
                <p className="text-muted-foreground">Track your long-term objectives</p>
              </div>
              <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingGoal(null); resetGoalForm(); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
                    <DialogDescription>Set your target and track your progress</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal-title">Title *</Label>
                      <Input
                        id="goal-title"
                        placeholder="e.g., Learn JavaScript"
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-description">Description</Label>
                      <Textarea
                        id="goal-description"
                        placeholder="Describe your goal..."
                        value={goalDescription}
                        onChange={(e) => setGoalDescription(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="goal-category">Category *</Label>
                        <Select value={goalCategory} onValueChange={setGoalCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Health">Health</SelectItem>
                            <SelectItem value="Learning">Learning</SelectItem>
                            <SelectItem value="Career">Career</SelectItem>
                            <SelectItem value="Personal">Personal</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-status">Status</Label>
                        <Select value={goalStatus} onValueChange={setGoalStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Planning">Planning</SelectItem>
                            <SelectItem value="Paused">Paused</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-target-date">Target Date</Label>
                      <Input
                        id="goal-target-date"
                        type="date"
                        value={goalTargetDate}
                        onChange={(e) => setGoalTargetDate(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={resetGoalForm}>Cancel</Button>
                      <Button onClick={handleSaveGoal}>{editingGoal ? 'Update' : 'Create'} Goal</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => {
                const progress = getGoalProgress(goal.id)
                const goalTasks = tasks.filter(t => t.goalId === goal.id)

                return (
                  <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          <CardDescription className="mt-1">{goal.description}</CardDescription>
                        </div>
                        <Badge variant={goal.status === 'Active' ? 'default' : goal.status === 'Completed' ? 'secondary' : 'outline'}>
                          {goal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{goal.category}</Badge>
                        {goal.targetDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {goalTasks.length} task{goalTasks.length !== 1 ? 's' : ''}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setEditingGoal(goal)
                            setGoalTitle(goal.title)
                            setGoalDescription(goal.description || '')
                            setGoalCategory(goal.category)
                            setGoalStatus(goal.status)
                            setGoalTargetDate(goal.targetDate || '')
                            setShowGoalDialog(true)
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedGoalFilter(goal.id)
                            setActiveTab('tasks')
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          View Tasks ({goalTasks.length})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {goals.length === 0 && (
              <Card className="p-8 text-center">
                <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No goals yet</h3>
                <p className="text-muted-foreground mb-4">Start by creating your first goal</p>
                <Button onClick={() => setShowGoalDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Daily Tasks Tab - Enhanced with Drag & Drop */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Daily Tasks</h2>
                <p className="text-muted-foreground">Drag tasks to reorder - Track your progress</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Bulk Import
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bulk Import Tasks</DialogTitle>
                      <DialogDescription>Import multiple tasks from JSON or CSV</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Format</Label>
                        <Select value={importFormat} onValueChange={setImportFormat}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Textarea
                          placeholder={importFormat === 'json'
                            ? '[{"goalTitle": "Learn JavaScript", "title": "Complete tutorial", "date": "2025-01-15"}]'
                            : 'goalTitle,title,date,time,description'}
                          value={importData}
                          onChange={(e) => setImportData(e.target.value)}
                          className="min-h-[200px] font-mono text-sm"
                        />
                      </div>
                      <Button onClick={handleBulkImport} className="w-full">Import Tasks</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingTask(null); resetTaskForm(); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                      <DialogDescription>Link a task to one of your goals</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="task-title">Title *</Label>
                        <Input
                          id="task-title"
                          placeholder="e.g., Complete tutorial chapter"
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-description">Description</Label>
                        <Textarea
                          id="task-description"
                          placeholder="Describe your task..."
                          value={taskDescription}
                          onChange={(e) => setTaskDescription(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="task-date">Date *</Label>
                          <Input
                            id="task-date"
                            type="date"
                            value={taskDate}
                            onChange={(e) => setTaskDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="task-time">Time</Label>
                          <Input
                            id="task-time"
                            type="time"
                            value={taskTime}
                            onChange={(e) => setTaskTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-goal">Goal *</Label>
                        <Select value={taskGoalId} onValueChange={setTaskGoalId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select goal" />
                          </SelectTrigger>
                          <SelectContent>
                            {goals.map((goal) => (
                              <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={resetTaskForm}>Cancel</Button>
                        <Button onClick={handleSaveTask}>{editingTask ? 'Update' : 'Create'} Task</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Task Filters - New Tabs within Tasks */}
            <div className="flex gap-2 mb-4 border-b pb-4">
              <Button
                variant={taskSection === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTaskSection('all')}
              >
                All Tasks
              </Button>
              <Button
                variant={taskSection === 'today' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTaskSection('today')}
              >
                <Sun className="w-4 h-4 mr-1" />
                Today
              </Button>
              <Button
                variant={taskSection === 'incomplete' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTaskSection('incomplete')}
              >
                <Circle className="w-4 h-4 mr-1" />
                Incomplete
              </Button>
              <Button
                variant={taskSection === 'completed' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTaskSection('completed')}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Completed
              </Button>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTaskViewMode(taskViewMode === 'list' ? 'grid' : 'list')}
                >
                  {taskViewMode === 'list' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Filter indicator */}
            {selectedGoalFilter && (
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="default" className="text-sm">
                  Filtering by goal: {goals.find(g => g.id === selectedGoalFilter)?.title}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGoalFilter(null)}
                  className="h-7 text-xs px-2"
                >
                  <X className="w-3 h-3" />
                  Clear Filter
                </Button>
              </div>
            )}

            {/* Task Count Badge */}
            <div className="mb-4">
              <Badge variant="outline" className="text-sm">
                {taskSection === 'all' && 'All Tasks'}
                {taskSection === 'today' && "Today's Tasks"}
                {taskSection === 'incomplete' && 'Incomplete Tasks'}
                {taskSection === 'completed' && 'Completed Tasks'}
                {` (${filteredTasks.length})`}
              </Badge>
            </div>

            {/* Tasks Display */}
            <div className={taskViewMode === 'list' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
              {filteredTasks.length === 0 ? (
                <Card className="p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {selectedGoalFilter ? 'No tasks for this goal' : `No ${taskSection} tasks`}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedGoalFilter ? 'Create tasks for this goal' : 'Start by creating your first task'}
                  </p>
                  <Button onClick={() => setShowTaskDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {selectedGoalFilter ? 'Add Task to This Goal' : 'Create Your First Task'}
                  </Button>
                </Card>
              ) : (
                filteredTasks.map((task, index) => {
                  const goal = goals.find(g => g.id === task.goalId)
                  const today = new Date().toISOString().split('T')[0]
                  const isToday = task.date === today
                  const isDragging = draggedTaskId === task.id

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', task.id)
                        handleDragStart(task.id)
                      }}
                      onDragEnd={() => handleDragEnd(task.id)}
                      className={`transition-all cursor-move ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'}`}
                    >
                      <Card
                        className={`hover:shadow-md transition-all ${task.completed ? 'opacity-60' : ''}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Drag Handle */}
                            <div className="cursor-grab active:cursor-grabbing mt-1">
                              <GripVertical className="w-5 h-5 text-muted-foreground" />
                            </div>

                            {/* Task Checkbox */}
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => handleToggleTask(task.id)}
                              className="mt-1"
                            />

                            {/* Task Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title}
                                  </h4>
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {task.learnings && task.learnings.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Lightbulb className="w-3 h-3 mr-1" />
                                      {task.learnings.length}
                                    </Badge>
                                  )}
                                  {task.notes && task.notes.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      <StickyNote className="w-3 h-3 mr-1" />
                                      {task.notes.length}
                                    </Badge>
                                  )}
                                  {task.photos && task.photos.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      <ImageIcon className="w-3 h-3 mr-1" />
                                      {task.photos.length}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Task Meta */}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge variant={isToday ? 'default' : 'outline'} className="text-xs">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {task.date}
                                </Badge>
                                {task.time && (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {task.time}
                                  </Badge>
                                )}
                                {goal && (
                                  <Badge variant="secondary" className="text-xs">
                                    {goal.title}
                                  </Badge>
                                )}
                              </div>

                              {/* Photos Preview */}
                              {task.photos && task.photos.length > 0 && (
                                <div className="flex gap-2 mt-3">
                                  {task.photos.slice(0, 3).map((photo) => (
                                    <div
                                      key={photo.id}
                                      className="w-12 h-12 rounded-md relative group"
                                      style={{ backgroundColor: photo.url }}
                                    >
                                      <button
                                        onClick={() => handleRemovePhoto(task.id, photo.id)}
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-md"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Task Actions */}
                            <div className="flex gap-1 mt-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedTask(task)
                                  setShowTaskDetail(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })
              )}
            </div>
          </TabsContent>

          {/* Revision Tab */}
          <TabsContent value="revision" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Daily Revision</h2>
              <p className="text-muted-foreground">Review what you accomplished yesterday</p>
            </div>

            {analytics.yesterdayCompletedTasks === 0 && analytics.yesterdayIncompleteTasks === 0 ? (
              <Card className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No activity yesterday</h3>
                <p className="text-muted-foreground">Complete some tasks to see them here</p>
              </Card>
            ) : (
              <>
                {analytics.yesterdayCompletedTasks > 0 && (
                  <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle2 className="w-5 h-5" />
                        Completed Tasks ({analytics.yesterdayCompletedTasks})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {tasks.filter(t => {
                        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
                        return t.date === yesterday && t.completed
                      }).map(task => {
                        const goal = goals.find(g => g.id === task.goalId)
                        return (
                          <div key={task.id} className="p-3 bg-background rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                {task.time && (
                                  <p className="text-sm text-muted-foreground">{task.time}</p>
                                )}
                                {goal && (
                                  <Badge variant="outline" className="text-xs mt-1">{goal.title}</Badge>
                                )}
                              </div>
                              {task.photos && task.photos.length > 0 && (
                                <div className="flex gap-1">
                                  {task.photos.map((photo) => (
                                    <div
                                      key={photo.id}
                                      className="w-8 h-8 rounded"
                                      style={{ backgroundColor: photo.url }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <Lightbulb className="w-5 h-5" />
                      Key Learnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tasks.filter(t => {
                      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
                      return t.date === yesterday && t.learnings && t.learnings.length > 0
                    }).map(task => (
                      <div key={task.id} className="space-y-2 mb-4">
                        <h4 className="font-medium">{task.title}</h4>
                        <ul className="space-y-1">
                          {task.learnings?.map((learning) => (
                            <li key={learning.id} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {learning.content}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {analytics.yesterdayIncompleteTasks > 0 && (
                  <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-5 h-5" />
                        Incomplete Tasks ({analytics.yesterdayIncompleteTasks})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {tasks.filter(t => {
                        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
                        return t.date === yesterday && !t.completed
                      }).map(task => {
                        const goal = goals.find(g => g.id === task.goalId)
                        return (
                          <div key={task.id} className="p-3 bg-background rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                {goal && (
                                  <Badge variant="outline" className="text-xs mt-1">{goal.title}</Badge>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  const newTask = { ...task, date: new Date().toISOString().split('T')[0] }
                                  await fetch('/api/tasks', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      userId: currentUser?.id,
                                      title: task.title,
                                      description: task.description,
                                      date: new Date().toISOString().split('T')[0],
                                      time: task.time,
                                      goalId: task.goalId
                                    })
                                  })
                                  loadUserData(currentUser!.id)
                                  toast({ title: 'Task moved to today!' })
                                }}
                              >
                                Move to Today
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <p className="text-muted-foreground">Track your progress and achievements</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Goals</CardDescription>
                  <CardTitle className="text-3xl">{analytics.totalGoals}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active Goals</CardDescription>
                  <CardTitle className="text-3xl">{analytics.activeGoals}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Tasks</CardDescription>
                  <CardTitle className="text-3xl">{analytics.totalTasks}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Photos</CardDescription>
                  <CardTitle className="text-3xl">{analytics.totalPhotos}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.map((goal) => {
                  const progress = getGoalProgress(goal.id)
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">{goal.title}</span>
                        <span className="text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goal Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(analytics.categoryBreakdown).map(([category, count]) => (
                    <div key={category} className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground">{category}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{analytics.todayTasks}</div>
                    <div className="text-sm text-muted-foreground">Today's Tasks</div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">{analytics.todayCompletedTasks}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                </div>
                {analytics.todayTasks > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Today's Progress</span>
                      <span className="font-medium">{Math.round((analytics.todayCompletedTasks / analytics.todayTasks) * 100)}%</span>
                    </div>
                    <Progress value={(analytics.todayCompletedTasks / analytics.todayTasks) * 100} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Timeline</h2>
              <p className="text-muted-foreground">Your complete journey at a glance</p>
            </div>

            <div className="space-y-4">
              {timelineEvents.length === 0 ? (
                <Card className="p-8 text-center">
                  <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No events yet</h3>
                  <p className="text-muted-foreground">Start creating goals and tasks to build your timeline</p>
                </Card>
              ) : (
                timelineEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {event.type === 'goal_created' && <Target className="w-5 h-5 text-primary" />}
                          {event.type === 'task_created' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                          {event.type === 'task_completed' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                          {event.type === 'reminder_created' && <Bell className="w-5 h-5 text-primary" />}
                          {event.type === 'bulk_import' && <Upload className="w-5 h-5 text-primary" />}
                          {event.type.includes('updated') && <Edit className="w-5 h-5 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Reminders</h2>
                <p className="text-muted-foreground">Never miss important tasks</p>
              </div>
              <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reminder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Reminder</DialogTitle>
                    <DialogDescription>Set up notifications for your tasks</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="reminder-title">Title *</Label>
                      <Input
                        id="reminder-title"
                        placeholder="e.g., Morning workout"
                        value={reminderTitle}
                        onChange={(e) => setReminderTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reminder-message">Message</Label>
                      <Textarea
                        id="reminder-message"
                        placeholder="Additional message..."
                        value={reminderMessage}
                        onChange={(e) => setReminderMessage(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reminder-date">Date *</Label>
                        <Input
                          id="reminder-date"
                          type="date"
                          value={reminderDate}
                          onChange={(e) => setReminderDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reminder-time">Time *</Label>
                        <Input
                          id="reminder-time"
                          type="time"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reminder-type">Notification Type</Label>
                      <Select value={reminderType} onValueChange={setReminderType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="browser">Browser Notification</SelectItem>
                          <SelectItem value="sound">Sound Alert</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleSaveReminder} className="w-full">Create Reminder</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reminders.map((reminder) => (
                <Card key={reminder.id} className={reminder.triggered ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{reminder.title}</CardTitle>
                      <Badge variant={reminder.triggered ? 'secondary' : 'default'}>
                        {reminder.triggered ? 'Triggered' : 'Active'}
                      </Badge>
                    </div>
                    {reminder.message && (
                      <CardDescription>{reminder.message}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {reminder.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {reminder.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Bell className="w-4 h-4" />
                      {reminder.type}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => handleDeleteReminder(reminder.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {reminders.length === 0 && (
              <Card className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No reminders yet</h3>
                <p className="text-muted-foreground mb-4">Create reminders for your important tasks</p>
                <Button onClick={() => setShowReminderDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Reminder
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Task Detail Dialog */}
      <Dialog open={showTaskDetail} onOpenChange={setShowTaskDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>Task Details</DialogTitle>
                <DialogDescription>
                  {selectedTask.title}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {selectedTask.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                  </div>
                )}

                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {selectedTask.date}
                  </div>
                  {selectedTask.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {selectedTask.time}
                    </div>
                  )}
                </div>

                {/* Photos Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Progress Photos ({selectedTask.photos?.length || 0})
                    </h4>
                    <Button size="sm" onClick={() => handleAddPhoto(selectedTask.id)}>
                      <Upload className="w-4 h-4 mr-1" />
                      Add Photo
                    </Button>
                  </div>
                  {selectedTask.photos && selectedTask.photos.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedTask.photos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <div
                            className="w-full aspect-square rounded-lg"
                            style={{ backgroundColor: photo.url }}
                          />
                          <button
                            onClick={() => handleRemovePhoto(selectedTask.id, photo.id)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity"
                          >
                            <X className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No photos yet</p>
                  )}
                </div>

                {/* Learnings Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      What I Learned ({selectedTask.learnings?.length || 0})
                    </h4>
                  </div>
                  {selectedTask.learnings && selectedTask.learnings.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTask.learnings.map((learning) => (
                        <div key={learning.id} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-sm">{learning.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No learnings recorded</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Add what you learned..."
                      value={newLearning}
                      onChange={(e) => setNewLearning(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddLearning(selectedTask.id)}
                    />
                    <Button size="sm" onClick={() => handleAddLearning(selectedTask.id)}>Add</Button>
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <StickyNote className="w-4 h-4" />
                      Important Notes ({selectedTask.notes?.length || 0})
                    </h4>
                  </div>
                  {selectedTask.notes && selectedTask.notes.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTask.notes.map((note) => (
                        <div key={note.id} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No notes yet</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Add an important note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNote(selectedTask.id)}
                    />
                    <Button size="sm" onClick={() => handleAddNote(selectedTask.id)}>Add</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>Manage your account</DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{currentUser.name}</h3>
                  <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <span className="font-medium">{currentUser.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Member since: </span>
                  <span className="font-medium">{new Date(currentUser.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total tasks: </span>
                  <span className="font-medium">{analytics.totalTasks}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="mt-auto border-t py-4 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 myJournal. Built with Next.js and shadcn/ui.</p>
        </div>
      </footer>
    </div>
  )
}

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
  AlertTriangle
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

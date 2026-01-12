"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMobile } from "@/hooks/use-mobile";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { AppLayout } from "@/components/layout/AppLayout";
import { GoalsTab } from "@/components/goals/GoalsTab";
import { AnalyticsTab } from "@/components/analytics/AnalyticsTab";
import { TimelineTab } from "@/components/timeline/TimelineTab";
import { RevisionTab } from "@/components/revision/RevisionTab";
import { RemindersTab } from "@/components/reminders/RemindersTab";
import { Goal, Task, Reminder, TimelineEvent, User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  User as UserIcon,
  Upload,
  X,
  Lightbulb,
  StickyNote,
  ArrowRight,
  AlertTriangle,
  LayoutGrid,
  List,
  Sun,
  Circle,
  CheckSquare, // Added for Checklist
} from "lucide-react";

// Types are now imported from @/types
import { DescriptionEditor } from "@/components/ui/description-editor";
import { MarkdownDisplay } from "@/components/ui/markdown-display";
import { supabase } from "@/lib/supabaseConnection";
import { TaskDialog } from "@/components/dialogs/TaskDialog";
import { TaskDetailDialog } from "@/components/dialogs/TaskDetailDialog";

import { ProfileDialog } from "@/components/dialogs/ProfileDialog";
import { PhotoViewer } from "@/components/dialogs/PhotoViewer";
import { TasksTab } from "@/components/tasks/TasksTab";

export default function Home() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Auth form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  // Application data
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  // Modal states
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoTaskId, setPhotoTaskId] = useState<string | null>(null);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null); // For lightbox
  const [showProfile, setShowProfile] = useState(false);
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<string | null>(null);


  // Form states
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Goal form
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalCategory, setGoalCategory] = useState("");
  const [goalStatus, setGoalStatus] = useState("Active");
  const [goalTargetDate, setGoalTargetDate] = useState("");

  // Task form
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskGoalId, setTaskGoalId] = useState("");
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [taskChecklist, setTaskChecklist] = useState<{ id: string; text: string; completed: boolean }[]>([]);

  // Reminder form
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderType, setReminderType] = useState("browser");

  // Learning & Notes
  const [newLearning, setNewLearning] = useState("");
  const [newNote, setNewNote] = useState("");



  // Initialize data
  useEffect(() => {
    const savedUser = localStorage.getItem("goalTracker_user");

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setActiveTab("goals");
      loadUserData(user.id);
    }

    // Request notification permission
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    // Check reminders every minute
    const reminderInterval = setInterval(checkReminders, 60000);
    return () => clearInterval(reminderInterval);
  }, []);

  // Active tab state for controlled tabs
  const [activeTab, setActiveTab] = useState("goals");

  // Mobile detection
  const isMobile = useMobile();

  // Load data from backend
  const loadUserData = async (userId: string) => {
    try {
      // Fetch goals
      const goalsRes = await fetch(`/api/goals?userId=${userId}`);
      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        setGoals(goalsData.goals || []);
      }

      // Fetch tasks
      const tasksRes = await fetch(`/api/tasks?userId=${userId}`);
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
      }

      // Fetch reminders
      const remindersRes = await fetch(`/api/reminders?userId=${userId}`);
      if (remindersRes.ok) {
        const remindersData = await remindersRes.json();
        setReminders(remindersData.reminders || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Auth functions
  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // If demo user, initialize demo data first
      if (username === "demo") {
        await fetch("/api/init-demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "demo" }),
        });
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Login failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      setCurrentUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem("goalTracker_user", JSON.stringify(data.user));
      loadUserData(data.user.id);
      setActiveTab("goals");
      toast({
        title: "Welcome back!",
        description: "Successfully logged in",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSignup = async () => {
    if (!username || !email || !name || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Signup failed",
          description: data.error || "An error occurred",
          variant: "destructive",
        });
        return;
      }

      // Clear form
      setUsername("");
      setEmail("");
      setName("");
      setPassword("");

      // Show success message and switch to login
      toast({
        title: "Account created successfully!",
        description: "Please login with your credentials",
      });
      setShowSignup(false);
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem("goalTracker_user");
    setGoals([]);
    setTasks([]);
    setReminders([]);
    setTimelineEvents([]);
    toast({ title: "Logged out successfully" });
  };

  // Goal functions
  const handleSaveGoal = async () => {
    if (!goalTitle || !goalCategory) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) return;

    try {
      if (editingGoal) {
        const res = await fetch(`/api/goals/${editingGoal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: goalTitle,
            description: goalDescription,
            category: goalCategory,
            status: goalStatus,
            targetDate: goalTargetDate,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setGoals(goals.map((g) => (g.id === editingGoal.id ? data.goal : g)));
          addTimelineEvent(
            "goal_updated",
            "Goal Updated",
            `You updated "${goalTitle}"`
          );
          toast({ title: "Goal updated!" });
        }
      } else {
        const res = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            title: goalTitle,
            description: goalDescription,
            category: goalCategory,
            status: goalStatus,
            targetDate: goalTargetDate,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setGoals([...goals, data.goal]);
          addTimelineEvent(
            "goal_created",
            "New Goal Created",
            `You set a goal to "${goalTitle}"`
          );
          toast({ title: "Goal created!" });
        }
      }
      resetGoalForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save goal",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setGoals(goals.filter((g) => g.id !== goalId));
        toast({ title: "Goal deleted!" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const resetGoalForm = () => {
    setEditingGoal(null);
    setGoalTitle("");
    setGoalDescription("");
    setGoalCategory("");
    setGoalStatus("Active");
    setGoalTargetDate("");
    setShowGoalDialog(false);
  };

  const resetTaskForm = () => {
    setEditingTask(null);
    setTaskTitle("");
    setTaskDescription("");
    const now = new Date();
    setTaskDate(now.toISOString().split('T')[0]);
    setTaskTime(now.toTimeString().slice(0, 5));
    setTaskGoalId("");
    setTaskPriority('Medium');
    setTaskChecklist([]);
    setShowTaskDialog(false);
  };

  const handleAddChecklistItem = () => {
    setTaskChecklist([...taskChecklist, { id: Date.now().toString(), text: '', completed: false }]);
  };

  const handleUpdateChecklistItem = (id: string, text: string) => {
    setTaskChecklist(taskChecklist.map(item => item.id === id ? { ...item, text } : item));
  };

  const handleRemoveChecklistItem = (id: string) => {
    setTaskChecklist(taskChecklist.filter(item => item.id !== id));
  };

  const handleToggleChecklistItem = (id: string) => {
    setTaskChecklist(taskChecklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  // Task functions
  const handleTaskChecklistToggle = async (taskId: string, itemId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.checklist) return;

    const newChecklist = task.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    // Optimistic Update
    const updatedTask = { ...task, checklist: newChecklist };
    setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updatedTask);
    }

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: newChecklist })
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update checklist",
        variant: "destructive",
      });
    }
  };

  const handleSaveTask = async () => {
    if (!taskTitle || !taskDate || !taskGoalId) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) return;

    try {
      if (editingTask) {
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: taskTitle,
            description: taskDescription,
            date: taskDate,
            time: taskTime,
            goalId: taskGoalId,
            priority: taskPriority,
            checklist: taskChecklist
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setTasks(tasks.map((t) => (t.id === editingTask.id ? data.task : t)));
          // Also update the selectedTask if it's the current task
          if (selectedTask && selectedTask.id === editingTask.id) {
            setSelectedTask(data.task);
          }
          addTimelineEvent(
            "task_updated",
            "Task Updated",
            `You updated "${taskTitle}"`
          );
          toast({ title: "Task updated!" });
        }
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            title: taskTitle,
            description: taskDescription,
            date: taskDate,
            time: taskTime,
            goalId: taskGoalId,
            priority: taskPriority,
            checklist: taskChecklist
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setTasks([...tasks, data.task]);
          addTimelineEvent(
            "task_created",
            "Task Added",
            `You added "${taskTitle}"`
          );
          toast({ title: "Task created!" });
        }
      }
      resetTaskForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save task",
        variant: "destructive",
      });
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      console.error("Task not found:", taskId);
      return;
    }

    console.log("Toggling task:", taskId, "Current completed:", task.completed);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("API response:", data.task);
        setTasks(tasks.map((t) => (t.id === taskId ? data.task : t)));
        // Also update the selectedTask if it's the current task
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(data.task);
        }
        const newCompletedStatus = !task.completed; // This is the new status after toggle
        addTimelineEvent(
          newCompletedStatus ? "task_completed" : "task_uncompleted",
          newCompletedStatus ? "Task Completed" : "Task Uncompleted",
          `You ${newCompletedStatus ? "completed" : "uncompleted"} "${task.title
          }"`
        );
        toast({
          title: newCompletedStatus ? "Task completed!" : "Task uncompleted!",
          description: `"${task.title}" is now ${newCompletedStatus ? "done" : "pending"
            }`,
        });
      } else {
        console.error("API error:", res.status);
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Toggle error:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTasks(tasks.filter((t) => t.id !== taskId));
        // Clear the selectedTask if it's the one being deleted
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(null);
        }
        toast({ title: "Task deleted!" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };



  // Photo functions
  const handleAddPhoto = (taskId: string) => {
    setPhotoTaskId(taskId);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !photoTaskId) return;

    try {
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(`${currentUser?.id}/${filename}`, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('photos')
        .getPublicUrl(`${currentUser?.id}/${filename}`);

      const publicUrl = publicUrlData.publicUrl;

      // Save to DB
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: photoTaskId,
          url: publicUrl,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update State
        const updateTaskPhotos = (task: Task) => ({
          ...task,
          photos: [...(task.photos || []), data.photo]
        });

        setTasks(prev => prev.map(t => t.id === photoTaskId ? updateTaskPhotos(t) : t));
        if (selectedTask && selectedTask.id === photoTaskId) {
          setSelectedTask(prev => prev ? updateTaskPhotos(prev) : null);
        }

        toast({ title: "Photo added!" });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to upload photo. Ensure 'photos' bucket exists.",
        variant: "destructive",
      });
    } finally {
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
      setPhotoTaskId(null);
    }
  };

  const handleRemovePhoto = async (taskId: string, photoId: string) => {
    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTasks(
          tasks.map((t) =>
            t.id === taskId
              ? {
                ...t,
                photos: (t.photos || []).filter((p) => p.id !== photoId),
              }
              : t
          )
        );
        // Also update the selectedTask if it's the current task
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...selectedTask,
            photos: (selectedTask.photos || []).filter((p) => p.id !== photoId),
          });
        }
        toast({ title: "Photo removed!" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove photo",
        variant: "destructive",
      });
    }
  };

  // Learning & Notes functions
  const handleAddLearning = async (taskId: string) => {
    if (!newLearning.trim()) return;

    try {
      const res = await fetch("/api/learnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          content: newLearning,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(
          tasks.map((t) =>
            t.id === taskId
              ? { ...t, learnings: [...(t.learnings || []), data.learning] }
              : t
          )
        );
        // Also update the selectedTask if it's the current task
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...selectedTask,
            learnings: [...(selectedTask.learnings || []), data.learning],
          });
        }
        setNewLearning("");
        toast({ title: "Learning added!" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add learning",
        variant: "destructive",
      });
    }
  };

  const handleAddNote = async (taskId: string) => {
    if (!newNote.trim()) return;

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          content: newNote,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(
          tasks.map((t) =>
            t.id === taskId
              ? { ...t, notes: [...(t.notes || []), data.note] }
              : t
          )
        );
        // Also update the selectedTask if it's the current task
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...selectedTask,
            notes: [...(selectedTask.notes || []), data.note],
          });
        }
        setNewNote("");
        toast({ title: "Note added!" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  };

  // Reminder functions
  const handleSaveReminder = async () => {
    if (!reminderTitle || !reminderDate || !reminderTime || !currentUser) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          title: reminderTitle,
          message: reminderMessage,
          date: reminderDate,
          time: reminderTime,
          type: reminderType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReminders([...reminders, data.reminder]);
        addTimelineEvent(
          "reminder_created",
          "Reminder Set",
          `You set a reminder for "${reminderTitle}"`
        );
        toast({ title: "Reminder set!" });
      }

      setReminderTitle("");
      setReminderMessage("");
      setReminderDate("");
      setReminderTime("");
      setShowReminderDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set reminder",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const res = await fetch(`/api/reminders/${reminderId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setReminders(reminders.filter((r) => r.id !== reminderId));
        toast({ title: "Reminder deleted!" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive",
      });
    }
  };

  const checkReminders = () => {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    reminders.forEach((reminder) => {
      if (
        !reminder.triggered &&
        reminder.date === currentDate &&
        reminder.time <= currentTime
      ) {
        if (reminder.type === "browser" || reminder.type === "both") {
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification(reminder.title, {
              body: reminder.message || "Time for your reminder!",
              icon: "/logo.svg",
            });
          }
          toast({
            title: reminder.title,
            description: reminder.message || "Time for your reminder!",
          });
        }

        setReminders((prev) =>
          prev.map((r) =>
            r.id === reminder.id ? { ...r, triggered: true } : r
          )
        );
      }
    });
  };

  // Timeline functions
  const addTimelineEvent = (
    type: string,
    title: string,
    description: string
  ) => {
    const newEvent: TimelineEvent = {
      id: `timeline-${Date.now()}`,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
    };
    setTimelineEvents([newEvent, ...timelineEvents]);
  };

  // Bulk import functions


  // Analytics calculations
  const getAnalytics = () => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    const activeGoals = goals.filter((g) => g.status === "Active");
    const completedGoals = goals.filter((g) => g.status === "Completed");

    const todayTasks = tasks.filter((t) => t.date === today);
    const todayCompletedTasks = todayTasks.filter((t) => t.completed);

    const yesterdayTasks = tasks.filter((t) => t.date === yesterday);
    const yesterdayCompletedTasks = yesterdayTasks.filter((t) => t.completed);
    const yesterdayIncompleteTasks = yesterdayTasks.filter((t) => !t.completed);

    const totalPhotos = tasks.reduce(
      (sum, t) => sum + (t.photos?.length || 0),
      0
    );

    const categoryBreakdown = goals.reduce((acc, goal) => {
      acc[goal.category] = (acc[goal.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
      categoryBreakdown,
    };
  };

  const analytics = getAnalytics();

  // Calculate goal progress
  const getGoalProgress = (goalId: string) => {
    const goalTasks = tasks.filter((t) => t.goalId === goalId);
    if (goalTasks.length === 0) return 0;
    const completedTasks = goalTasks.filter((t) => t.completed);
    return Math.round((completedTasks.length / goalTasks.length) * 100);
  };

  // Get filtered tasks based on section and goal filter


  // Filtered tasks for display


  // Main App Content - Single return with conditional rendering
  return (
    <>
      {!isAuthenticated ? (
        <AuthScreen onLogin={() => { }} setActiveTab={setActiveTab} />
      ) : (
        <AppLayout
          currentUser={currentUser}
          isMobile={isMobile}
          activeTab={activeTab}
          onSetActiveTab={setActiveTab}
          onShowProfile={() => setShowProfile(true)}
        >
          <Tabs value={activeTab} className="space-y-6">
            {/* Goals Tab */}
            <GoalsTab
              goals={goals}
              tasks={tasks}
              currentUser={currentUser}
              isMobile={isMobile}
              onGoalsChange={setGoals}
              showGoalDialog={showGoalDialog}
              setShowGoalDialog={setShowGoalDialog}
              onAddTimelineEvent={addTimelineEvent}
              onSetSelectedGoalFilter={setSelectedGoalFilter}
              onSetActiveTab={setActiveTab}
            />

            {/* Daily Tasks Tab - Enhanced with Drag & Drop */}
            {/* Daily Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4">
              <TasksTab
                tasks={tasks}
                goals={goals}
                currentUser={currentUser}
                isMobile={isMobile}
                onTasksChange={setTasks}
                onSelectTask={(task) => {
                  setSelectedTask(task);
                  setShowTaskDetail(true);
                }}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onAddTimelineEvent={addTimelineEvent}
                onShowTaskDialog={(goalId) => {
                  setEditingTask(null);
                  resetTaskForm();
                  if (goalId) {
                    setTaskGoalId(goalId);
                  } else if (goals.length > 0) {
                    setTaskGoalId(goals[0].id);
                  }
                  setShowTaskDialog(true);
                }}
                onRemovePhoto={handleRemovePhoto}
                selectedGoalFilter={selectedGoalFilter}
                onSetSelectedGoalFilter={setSelectedGoalFilter}
              />
            </TabsContent>

            {/* Revision Tab */}
            <RevisionTab
              analytics={analytics}
              tasks={tasks}
              goals={goals}
              currentUser={currentUser}
              onLoadUserData={loadUserData}
            />

            {/* Analytics Tab - Only render when active */}
            {activeTab === "analytics" && (
              <div className="space-y-4">
                <AnalyticsTab
                  analytics={analytics}
                  goals={goals}
                  getGoalProgress={getGoalProgress}
                />
              </div>
            )}

            {/* Timeline Tab */}
            <TimelineTab timelineEvents={timelineEvents} />

            {/* Reminders Tab */}
            <RemindersTab
              reminders={reminders}
              currentUser={currentUser}
              onRemindersChange={setReminders}
              onAddTimelineEvent={addTimelineEvent}
            />
          </Tabs>

          {/* Task Detail Dialog */}
          {/* Task Detail Dialog */}
          <TaskDetailDialog
            open={showTaskDetail}
            onOpenChange={setShowTaskDetail}
            selectedTask={selectedTask}
            onEdit={() => {
              if (selectedTask) {
                setEditingTask(selectedTask);
                setTaskTitle(selectedTask.title);
                setTaskDescription(selectedTask.description || "");
                setTaskDate(selectedTask.date);
                setTaskTime(selectedTask.time || "");
                setTaskGoalId(selectedTask.goalId);
                setTaskPriority(selectedTask.priority || 'Medium');
                setTaskChecklist(selectedTask.checklist || []);
                setShowTaskDetail(false);
                setShowTaskDialog(true);
              }
            }}
            onChecklistToggle={handleTaskChecklistToggle}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
            onViewImage={setViewingImageUrl}
            newLearning={newLearning}
            setNewLearning={setNewLearning}
            onAddLearning={handleAddLearning}
            newNote={newNote}
            setNewNote={setNewNote}
            onAddNote={handleAddNote}
          />

          <TaskDialog
            open={showTaskDialog}
            onOpenChange={setShowTaskDialog}
            taskTitle={taskTitle}
            setTaskTitle={setTaskTitle}
            taskDescription={taskDescription}
            setTaskDescription={setTaskDescription}
            taskDate={taskDate}
            setTaskDate={setTaskDate}
            taskTime={taskTime}
            setTaskTime={setTaskTime}
            taskPriority={taskPriority}
            setTaskPriority={setTaskPriority}
            taskGoalId={taskGoalId}
            setTaskGoalId={setTaskGoalId}
            taskChecklist={taskChecklist}
            onAddChecklistItem={handleAddChecklistItem}
            onUpdateChecklistItem={handleUpdateChecklistItem}
            onRemoveChecklistItem={handleRemoveChecklistItem}
            onToggleChecklistItem={handleToggleChecklistItem}
            onSave={handleSaveTask}
            onCancel={resetTaskForm}
            goals={goals}
            editingTask={editingTask}
          />

          {/* Profile Dialog */}
          {/* Profile Dialog */}
          <ProfileDialog
            open={showProfile}
            onOpenChange={setShowProfile}
            currentUser={currentUser}
            analytics={analytics}
            onLogout={handleLogout}
          />

          {/* Floating Action Button for Mobile */}
          {isMobile && (
            <div className="fixed right-4 z-50 bottom-[calc(6rem+env(safe-area-inset-bottom))]">
              {activeTab === "goals" && (
                <Button
                  size="lg"
                  className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
                  onClick={() => {
                    setEditingGoal(null);
                    resetGoalForm();
                    setShowGoalDialog(true);
                  }}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              )}
              {(activeTab === "tasks" || activeTab === "revision") && (
                <Button
                  size="lg"
                  className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
                  onClick={() => {
                    setEditingTask(null);
                    resetTaskForm();
                    if (selectedGoalFilter) {
                      setTaskGoalId(selectedGoalFilter);
                    } else if (goals.length > 0) {
                      setTaskGoalId(goals[0].id);
                    }
                    setShowTaskDialog(true);
                  }}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              )}
            </div>
          )}
        </AppLayout>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*"
      />

      <PhotoViewer
        url={viewingImageUrl}
        onClose={() => setViewingImageUrl(null)}
      />
    </>
  );
}

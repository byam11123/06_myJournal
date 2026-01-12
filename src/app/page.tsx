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
  const [showBulkImport, setShowBulkImport] = useState(false);

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

  // Bulk import
  const [importData, setImportData] = useState("");
  const [importFormat, setImportFormat] = useState("json");

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Task view mode within Tasks tab
  const [taskViewMode, setTaskViewMode] = useState<"list" | "grid">("list");
  const [taskSection, setTaskSection] = useState<
    "all" | "today" | "completed" | "incomplete"
  >("all");
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<string | null>(
    null
  );

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

  // Drag and drop functions
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = async (taskId: string) => {
    if (!draggedTaskId || draggedTaskId === taskId) {
      setDraggedTaskId(null);
      return;
    }

    try {
      // Swap tasks in array
      const taskIndex1 = tasks.findIndex((t) => t.id === draggedTaskId);
      const taskIndex2 = tasks.findIndex((t) => t.id === taskId);

      if (taskIndex1 === -1 || taskIndex2 === -1) {
        setDraggedTaskId(null);
        return;
      }

      const newTasks = [...tasks];
      const [removed] = newTasks.splice(taskIndex1, 1);
      newTasks.splice(taskIndex2, 0, removed[0]);

      setTasks(newTasks);
      setDraggedTaskId(null);
    } catch (error) {
      console.error("Failed to reorder tasks:", error);
      setDraggedTaskId(null);
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
  const handleBulkImport = () => {
    try {
      let importedTasks: any[] = [];

      if (importFormat === "json") {
        importedTasks = JSON.parse(importData);
      } else if (importFormat === "csv") {
        const lines = importData.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());
        importedTasks = lines
          .slice(1)
          .map((line) => {
            const values = line.split(",").map((v) => v.trim());
            const task: any = {};
            headers.forEach((header, index) => {
              task[header] = values[index];
            });
            return task;
          })
          .filter((task) => task.title && task.date);
      }

      const newTasks = importedTasks.map((item: any) => {
        const goal = goals.find((g) =>
          g.title.toLowerCase().includes(item.goalTitle?.toLowerCase() || "")
        );
        return {
          id: `task-${Date.now()}-${Math.random()}`,
          title: item.title,
          description: item.description || null,
          date: item.date,
          time: item.time || null,
          completed: false,
          goalId: goal?.id || goals[0]?.id || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      setTasks([...tasks, ...newTasks]);
      addTimelineEvent(
        "bulk_import",
        "Bulk Import",
        `You imported ${newTasks.length} tasks`
      );
      toast({
        title: "Import successful!",
        description: `${newTasks.length} tasks imported`,
      });

      setImportData("");
      setShowBulkImport(false);
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Please check your data format",
        variant: "destructive",
      });
    }
  };

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
  const getFilteredTasks = () => {
    const today = new Date().toISOString().split("T")[0];

    // First apply section filter (all/today/completed/incomplete)
    let filtered = tasks;
    switch (taskSection) {
      case "today":
        filtered = tasks.filter((t) => t.date === today);
        break;
      case "completed":
        filtered = tasks.filter((t) => t.completed);
        break;
      case "incomplete":
        filtered = tasks.filter((t) => !t.completed);
        break;
      case "all":
      default:
        break;
    }

    // Then apply goal filter if active
    if (selectedGoalFilter) {
      filtered = filtered.filter((t) => t.goalId === selectedGoalFilter);
    }

    // Sort by Priority (High > Medium > Low)
    filtered.sort((a, b) => {
      const priorityWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
      const pA = priorityWeight[a.priority || 'Medium'] || 2;
      const pB = priorityWeight[b.priority || 'Medium'] || 2;
      if (pA !== pB) return pB - pA;
      // Tie-break: default (e.g. date via API or stable sort)
      return 0;
    });

    return filtered;
  };

  // Filtered tasks for display
  const filteredTasks = getFilteredTasks();

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
            <TabsContent value="tasks" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Daily Tasks</h2>
                  <p className="text-muted-foreground">
                    Drag tasks to reorder - Track your progress
                  </p>
                </div>
                <div className="flex gap-2">
                  {!isMobile && (
                    <Dialog
                      open={showBulkImport}
                      onOpenChange={setShowBulkImport}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Bulk Import
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Bulk Import Tasks</DialogTitle>
                          <DialogDescription>
                            Import multiple tasks from JSON or CSV
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Format</Label>
                            <Select
                              value={importFormat}
                              onValueChange={setImportFormat}
                            >
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
                              placeholder={
                                importFormat === "json"
                                  ? '[{"goalTitle": "Learn JavaScript", "title": "Complete tutorial", "date": "2025-01-15"}]'
                                  : "goalTitle,title,date,time,description"
                              }
                              value={importData}
                              onChange={(e) => setImportData(e.target.value)}
                              className="min-h-[200px] font-mono text-sm"
                            />
                          </div>
                          <Button onClick={handleBulkImport} className="w-full">
                            Import Tasks
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  <Dialog
                    open={showTaskDialog}
                    onOpenChange={setShowTaskDialog}
                  >
                    {!isMobile && (
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            setEditingTask(null);
                            resetTaskForm();
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Task
                        </Button>
                      </DialogTrigger>
                    )}
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTask ? "Edit Task" : "Create New Task"}
                        </DialogTitle>
                        <DialogDescription>
                          Link a task to one of your goals
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 py-2">
                        <div className="space-y-1">
                          <Label htmlFor="task-title">Title *</Label>
                          <Input
                            id="task-title"
                            placeholder="e.g., Complete tutorial chapter"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="task-description">
                            Description
                          </Label>
                          <DescriptionEditor
                            value={taskDescription}
                            onChange={setTaskDescription}
                            placeholder="Describe your task... Use - for lists, **text** for bold."
                          />
                        </div>

                        {/* Checklist Section - Moved Here */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <Label>Checklist</Label>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddChecklistItem} className="h-7 px-2 text-xs">
                              <Plus className="w-3 h-3 mr-1" /> Add Item
                            </Button>
                          </div>
                          <div className="space-y-1">
                            {taskChecklist.map((item, index) => (
                              <div key={item.id} className="flex items-center gap-2">
                                <Checkbox
                                  checked={item.completed}
                                  onCheckedChange={() => handleToggleChecklistItem(item.id)}
                                />
                                <Input
                                  value={item.text}
                                  onChange={(e) => handleUpdateChecklistItem(item.id, e.target.value)}
                                  placeholder="Checklist item"
                                  className="flex-1 h-8 text-sm"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveChecklistItem(item.id)}
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </div>
                            ))}
                            {taskChecklist.length === 0 && (
                              <p className="text-sm text-muted-foreground italic">No checklist items</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="task-date">Date *</Label>
                            <Input
                              id="task-date"
                              type="date"
                              value={taskDate}
                              onChange={(e) => setTaskDate(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="task-time">Time</Label>
                            <Input
                              id="task-time"
                              type="time"
                              value={taskTime}
                              onChange={(e) => setTaskTime(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Priority Selection */}
                        <div className="space-y-1">
                          <Label>Priority</Label>
                          <Select value={taskPriority} onValueChange={(v: 'Low' | 'Medium' | 'High') => setTaskPriority(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="task-goal">Goal *</Label>
                          <Select
                            value={taskGoalId}
                            onValueChange={setTaskGoalId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select goal" />
                            </SelectTrigger>
                            <SelectContent>
                              {goals.map((goal) => (
                                <SelectItem key={goal.id} value={goal.id}>
                                  {goal.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={resetTaskForm}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveTask}>
                            {editingTask ? "Update" : "Create"} Task
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Task Filters - New Tabs within Tasks */}
              <div
                className={`flex gap-2 mb-4 border-b pb-4 ${isMobile ? "overflow-x-auto" : ""
                  }`}
              >
                <Button
                  variant={taskSection === "all" ? "default" : "ghost"}
                  size={isMobile ? "sm" : "sm"}
                  onClick={() => setTaskSection("all")}
                  className={isMobile ? "whitespace-nowrap" : ""}
                >
                  All Tasks
                </Button>
                <Button
                  variant={taskSection === "today" ? "default" : "ghost"}
                  size={isMobile ? "sm" : "sm"}
                  onClick={() => setTaskSection("today")}
                  className={isMobile ? "whitespace-nowrap" : ""}
                >
                  <Sun className="w-4 h-4 mr-1" />
                  Today
                </Button>
                <Button
                  variant={taskSection === "incomplete" ? "default" : "ghost"}
                  size={isMobile ? "sm" : "sm"}
                  onClick={() => setTaskSection("incomplete")}
                  className={isMobile ? "whitespace-nowrap" : ""}
                >
                  <Circle className="w-4 h-4 mr-1" />
                  Incomplete
                </Button>
                <Button
                  variant={taskSection === "completed" ? "default" : "ghost"}
                  size={isMobile ? "sm" : "sm"}
                  onClick={() => setTaskSection("completed")}
                  className={isMobile ? "whitespace-nowrap" : ""}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Completed
                </Button>
                <div
                  className={`flex items-center gap-2 ${isMobile ? "ml-2" : "ml-4"
                    }`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setTaskViewMode(taskViewMode === "list" ? "grid" : "list")
                    }
                  >
                    {taskViewMode === "list" ? (
                      <LayoutGrid className="w-4 h-4" />
                    ) : (
                      <List className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Filter indicator */}
              {selectedGoalFilter && (
                <div className="mb-4 flex items-center gap-2">
                  <Badge variant="default" className="text-sm">
                    Filtering by goal:{" "}
                    {goals.find((g) => g.id === selectedGoalFilter)?.title}
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
                  {taskSection === "all" && "All Tasks"}
                  {taskSection === "today" && "Today's Tasks"}
                  {taskSection === "incomplete" && "Incomplete Tasks"}
                  {taskSection === "completed" && "Completed Tasks"}
                  {` (${filteredTasks.length})`}
                </Badge>
              </div>

              {/* Tasks Display */}
              <div
                className={
                  taskViewMode === "list"
                    ? "space-y-3"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                }
              >
                {filteredTasks.length === 0 ? (
                  <Card className="p-8 text-center">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {selectedGoalFilter
                        ? "No tasks for this goal"
                        : `No ${taskSection} tasks`}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {selectedGoalFilter
                        ? "Create tasks for this goal"
                        : "Start by creating your first task"}
                    </p>
                    {isMobile ? null : (
                      <Button onClick={() => setShowTaskDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        {selectedGoalFilter
                          ? "Add Task to This Goal"
                          : "Create Your First Task"}
                      </Button>
                    )}
                  </Card>
                ) : (
                  filteredTasks.map((task, index) => {
                    const goal = goals.find((g) => g.id === task.goalId);
                    const today = new Date().toISOString().split("T")[0];
                    const isToday = task.date === today;
                    const isDragging = draggedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable={!isMobile} // Disable drag on mobile
                        onDragStart={
                          !isMobile
                            ? (e) => {
                              e.dataTransfer.setData("text/plain", task.id);
                              handleDragStart(task.id);
                            }
                            : undefined
                        }
                        onDragEnd={
                          !isMobile ? () => handleDragEnd(task.id) : undefined
                        }
                        className={`transition-all ${isMobile ? "cursor-pointer" : "cursor-move"
                          } ${isDragging
                            ? "opacity-50 scale-95"
                            : "hover:scale-[1.02]"
                          }`}
                      >
                        <Card
                          className={`hover:shadow-md transition-all ${task.completed ? "opacity-60" : ""
                            }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Mobile: Larger touch targets */}
                              {isMobile ? (
                                <>
                                  {/* Task Checkbox - Larger touch target */}
                                  <div className="mt-1">
                                    <Checkbox
                                      checked={task.completed ?? false}
                                      onCheckedChange={() =>
                                        handleToggleTask(task.id)
                                      }
                                      className="w-6 h-6 data-[state=checked]:w-6 data-[state=checked]:h-6"
                                    />
                                  </div>

                                  {/* Task Content - Full width for tap area */}
                                  <div
                                    className="flex-1 min-w-0 flex-grow"
                                    onClick={() => {
                                      setSelectedTask(task);
                                      setShowTaskDetail(true);
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <h4
                                          className={`font-medium ${task.completed
                                            ? "line-through text-muted-foreground"
                                            : ""
                                            }`}
                                        >
                                          {task.title}
                                        </h4>
                                        {task.description && (
                                          <p className="text-sm text-muted-foreground mt-1">
                                            {task.description}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {task.learnings &&
                                          task.learnings.length > 0 && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              <Lightbulb className="w-3 h-3 mr-1" />
                                              {task.learnings.length}
                                            </Badge>
                                          )}
                                        {task.notes &&
                                          task.notes.length > 0 && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              <StickyNote className="w-3 h-3 mr-1" />
                                              {task.notes.length}
                                            </Badge>
                                          )}
                                        {task.photos &&
                                          task.photos.length > 0 && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              <ImageIcon className="w-3 h-3 mr-1" />
                                              {task.photos.length}
                                            </Badge>
                                          )}
                                      </div>
                                    </div>

                                    {/* Task Meta */}
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                      <Badge
                                        variant={
                                          isToday ? "default" : "outline"
                                        }
                                        className="text-xs"
                                      >
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {task.date}
                                      </Badge>
                                      {task.time && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          <Clock className="w-3 h-3 mr-1" />
                                          {task.time}
                                        </Badge>
                                      )}
                                      {goal && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {goal.title}
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Photos Preview */}
                                    {task.photos && task.photos.length > 0 && (
                                      <div className="flex gap-2 mt-3">
                                        {task.photos
                                          .slice(0, 3)
                                          .map((photo) => (
                                            <div
                                              key={photo.id}
                                              className="w-12 h-12 rounded-md relative group"
                                              style={{
                                                backgroundColor: photo.url,
                                              }}
                                            >
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleRemovePhoto(
                                                    task.id,
                                                    photo.id
                                                  );
                                                }}
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-md"
                                              >
                                                <X className="w-4 h-4" />
                                              </button>
                                            </div>
                                          ))}
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                // Desktop: Original layout with drag handle
                                <>
                                  {/* Drag Handle */}
                                  <div className="cursor-grab active:cursor-grabbing mt-1">
                                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                                  </div>

                                  {/* Task Checkbox */}
                                  <Checkbox
                                    checked={task.completed ?? false}
                                    onCheckedChange={() =>
                                      handleToggleTask(task.id)
                                    }
                                    className="mt-1"
                                  />

                                  {/* Task Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <h4
                                          className={`font-medium ${task.completed
                                            ? "line-through text-muted-foreground"
                                            : ""
                                            }`}
                                        >
                                          {task.title}
                                        </h4>
                                        {task.description && (
                                          <p className="text-sm text-muted-foreground mt-1">
                                            {task.description}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {task.learnings &&
                                          task.learnings.length > 0 && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              <Lightbulb className="w-3 h-3 mr-1" />
                                              {task.learnings.length}
                                            </Badge>
                                          )}
                                        {task.notes &&
                                          task.notes.length > 0 && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              <StickyNote className="w-3 h-3 mr-1" />
                                              {task.notes.length}
                                            </Badge>
                                          )}
                                        {task.photos &&
                                          task.photos.length > 0 && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              <ImageIcon className="w-3 h-3 mr-1" />
                                              {task.photos.length}
                                            </Badge>
                                          )}
                                      </div>
                                    </div>

                                    {/* Task Meta */}
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                      <Badge
                                        variant={
                                          isToday ? "default" : "outline"
                                        }
                                        className="text-xs"
                                      >
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {task.date}
                                      </Badge>
                                      {task.time && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          <Clock className="w-3 h-3 mr-1" />
                                          {task.time}
                                        </Badge>
                                      )}
                                      {goal && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {goal.title}
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Photos Preview */}
                                    {task.photos && task.photos.length > 0 && (
                                      <div className="flex gap-2 mt-3">
                                        {task.photos
                                          .slice(0, 3)
                                          .map((photo) => (
                                            <div
                                              key={photo.id}
                                              className="w-12 h-12 rounded-md relative group"
                                              style={{
                                                backgroundColor: photo.url,
                                              }}
                                            >
                                              <button
                                                onClick={() =>
                                                  handleRemovePhoto(
                                                    task.id,
                                                    photo.id
                                                  )
                                                }
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
                                        setSelectedTask(task);
                                        setShowTaskDetail(true);
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
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })
                )}
              </div>
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
          <Dialog open={showTaskDetail} onOpenChange={setShowTaskDetail}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {selectedTask && (
                <>
                  <DialogHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <DialogTitle>Task Details</DialogTitle>
                        <DialogDescription>{selectedTask.title}</DialogDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
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
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {selectedTask.description && (
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <MarkdownDisplay content={selectedTask.description} />
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

                    {/* Checklist View */}
                    {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <CheckSquare className="w-4 h-4" />
                            Checklist ({selectedTask.checklist.filter(i => i.completed).length}/{selectedTask.checklist.length})
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {selectedTask.checklist.map((item) => (
                            <div key={item.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                              <Checkbox
                                checked={item.completed}
                                onCheckedChange={() => handleTaskChecklistToggle(selectedTask.id, item.id)}
                                className="mt-1"
                              />
                              <span className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Photos Section */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Progress Photos ({selectedTask.photos?.length || 0})
                        </h4>
                        <Button
                          size="sm"
                          onClick={() => handleAddPhoto(selectedTask.id)}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Add Photo
                        </Button>
                      </div>
                      {selectedTask.photos && selectedTask.photos.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                          {selectedTask.photos.map((photo) => (
                            <div key={photo.id} className="relative group">
                              <img
                                src={photo.url}
                                alt="Progress photo"
                                className="w-full aspect-square rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setViewingImageUrl(photo.url)}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemovePhoto(selectedTask.id, photo.id);
                                }}
                                className="absolute top-1 right-1 bg-black/50 hover:bg-red-500/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                title="Remove photo"
                              >
                                <X className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No photos yet
                        </p>
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
                      {selectedTask.learnings &&
                        selectedTask.learnings.length > 0 ? (
                        <div className="space-y-2">
                          {selectedTask.learnings.map((learning) => (
                            <div
                              key={learning.id}
                              className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
                            >
                              <p className="text-sm">{learning.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No learnings recorded
                        </p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Input
                          placeholder="Add what you learned..."
                          value={newLearning}
                          onChange={(e) => setNewLearning(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            handleAddLearning(selectedTask.id)
                          }
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddLearning(selectedTask.id)}
                        >
                          Add
                        </Button>
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
                            <div
                              key={note.id}
                              className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
                            >
                              <p className="text-sm">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No notes yet
                        </p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Input
                          placeholder="Add an important note..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddNote(selectedTask.id)
                          }
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddNote(selectedTask.id)}
                        >
                          Add
                        </Button>
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
                      <AvatarFallback>
                        {currentUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {currentUser.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        @{currentUser.username}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email: </span>
                      <span className="font-medium">{currentUser.email}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Member since:{" "}
                      </span>
                      <span className="font-medium">
                        {new Date(currentUser.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Total tasks:{" "}
                      </span>
                      <span className="font-medium">
                        {analytics.totalTasks}
                      </span>
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

      <Dialog open={!!viewingImageUrl} onOpenChange={(open) => !open && setViewingImageUrl(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90 border-none shadow-2xl">
          <DialogTitle className="sr-only">Photo Viewer</DialogTitle>
          <div className="relative flex items-center justify-center min-h-[50vh] max-h-[90vh] w-full">
            {viewingImageUrl && (
              <img
                src={viewingImageUrl}
                alt="Full view"
                className="max-w-full max-h-[90vh] object-contain"
              />
            )}
            <button
              onClick={() => setViewingImageUrl(null)}
              className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/80 transition-colors cursor-pointer z-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

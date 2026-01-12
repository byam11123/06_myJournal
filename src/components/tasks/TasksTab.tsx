
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
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
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import {
    CheckCircle2,
    Clock,
    GripVertical,
    Image as ImageIcon,
    Plus,
    Trash2,
    Edit,
    Calendar,
    Upload,
    X,
    Lightbulb,
    StickyNote,
    LayoutGrid,
    List,
    Sun,
    Circle,
} from "lucide-react";
import { Task, Goal, User } from "@/types";

interface TasksTabProps {
    tasks: Task[];
    goals: Goal[];
    currentUser: User | null;
    isMobile: boolean;
    onTasksChange: (tasks: Task[]) => void;
    onSelectTask: (task: Task) => void;
    onToggleTask: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
    onAddTimelineEvent: (type: string, title: string, description: string) => void;
    onShowTaskDialog: () => void;
    onRemovePhoto: (taskId: string, photoId: string) => void;
    selectedGoalFilter: string | null;
    onSetSelectedGoalFilter: (goalId: string | null) => void;
}

export function TasksTab({
    tasks,
    goals,
    currentUser,
    isMobile,
    onTasksChange,
    onSelectTask,
    onToggleTask,
    onDeleteTask,
    onAddTimelineEvent,
    onShowTaskDialog,
    onRemovePhoto,
    selectedGoalFilter,
    onSetSelectedGoalFilter
}: TasksTabProps) {
    // Local View State
    const [taskViewMode, setTaskViewMode] = useState<"list" | "grid">("list");
    const [taskSection, setTaskSection] = useState<
        "all" | "today" | "completed" | "incomplete"
    >("all");

    // Drag and Drop State
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    // Bulk Import State
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [importData, setImportData] = useState("");
    const [importFormat, setImportFormat] = useState("json");

    // Filter Tasks Logic
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
            return 0;
        });

        return filtered;
    };

    const filteredTasks = getFilteredTasks();

    // Drag and Drop Handlers
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

            onTasksChange(newTasks);
            setDraggedTaskId(null);
        } catch (error) {
            console.error("Failed to reorder tasks:", error);
            setDraggedTaskId(null);
        }
    };

    // Bulk Import Handler
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
                    // Default valid fields
                    priority: 'Medium',
                    checklist: [],
                    photos: [],
                    learnings: [],
                    notes: []
                };
            });

            // Call parent handler to update tasks
            // Note: In real app, we might want to save to DB here or let parent handle it.
            // For now we assume parent handles state update, but here we're constructing new objects.
            // Ideally page.tsx should handle the import API call, but logic is here.
            // Let's pass the new tasks up.
            onTasksChange([...tasks, ...newTasks]);

            onAddTimelineEvent(
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

    return (
        <div className="space-y-4">
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

                    <Button
                        onClick={() => {
                            // We need to reset the form in parent, but here we just trigger the dialog open
                            // The parent should handle the reset logic when the dialog opens or via this callback if needed
                            // For now, we assume the parent passed a handler that might prep the form
                            onShowTaskDialog();
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                    </Button>
                </div>
            </div>

            {/* Task Filters */}
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
                        onClick={() => onSetSelectedGoalFilter(null)}
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
                            <Button onClick={onShowTaskDialog}>
                                <Plus className="w-4 h-4 mr-2" />
                                {selectedGoalFilter
                                    ? "Add Task to This Goal"
                                    : "Create Your First Task"}
                            </Button>
                        )}
                    </Card>
                ) : (
                    filteredTasks.map((task) => {
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
                                                                onToggleTask(task.id)
                                                            }
                                                            className="w-6 h-6 data-[state=checked]:w-6 data-[state=checked]:h-6"
                                                        />
                                                    </div>

                                                    {/* Task Content - Full width for tap area */}
                                                    <div
                                                        className="flex-1 min-w-0 flex-grow"
                                                        onClick={() => {
                                                            onSelectTask(task);
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
                                                                                    onRemovePhoto(
                                                                                        task.id,
                                                                                        photo.id
                                                                                    );
                                                                                }}
                                                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-md"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </button>
                                                                            {/* Mock image if URL fails (or just bg color) - in real app use img tag */}
                                                                            <img src={photo.url} className="w-full h-full object-cover rounded-md" alt="" />
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
                                                            onToggleTask(task.id)
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
                                                                                // backgroundColor: photo.url, // Fix: Use img tag
                                                                            }}
                                                                        >
                                                                            <img src={photo.url} className="w-full h-full object-cover rounded-md" alt="" />
                                                                            <button
                                                                                onClick={() =>
                                                                                    onRemovePhoto(
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
                                                                onSelectTask(task);
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => onDeleteTask(task.id)}
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
        </div>
    );
}

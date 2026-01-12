
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DescriptionEditor } from "@/components/ui/description-editor";
import { Plus, Trash2 } from "lucide-react";
import { Goal, Task } from "@/types";

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // Form State
    taskTitle: string;
    setTaskTitle: (value: string) => void;
    taskDescription: string;
    setTaskDescription: (value: string) => void;
    taskDate: string;
    setTaskDate: (value: string) => void;
    taskTime: string;
    setTaskTime: (value: string) => void;
    taskPriority: "Low" | "Medium" | "High";
    setTaskPriority: (value: "Low" | "Medium" | "High") => void;
    taskGoalId: string;
    setTaskGoalId: (value: string) => void;
    taskChecklist: { id: string; text: string; completed: boolean }[];
    // Checklist Handlers
    onAddChecklistItem: () => void;
    onUpdateChecklistItem: (id: string, text: string) => void;
    onRemoveChecklistItem: (id: string) => void;
    onToggleChecklistItem: (id: string) => void;
    // Actions
    onSave: () => void;
    onCancel: () => void;
    // Data
    goals: Goal[];
    editingTask: Task | null;
}

export function TaskDialog({
    open,
    onOpenChange,
    taskTitle,
    setTaskTitle,
    taskDescription,
    setTaskDescription,
    taskDate,
    setTaskDate,
    taskTime,
    setTaskTime,
    taskPriority,
    setTaskPriority,
    taskGoalId,
    setTaskGoalId,
    taskChecklist,
    onAddChecklistItem,
    onUpdateChecklistItem,
    onRemoveChecklistItem,
    onToggleChecklistItem,
    onSave,
    onCancel,
    goals,
    editingTask
}: TaskDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingTask ? "Edit Task" : "Create New Task"}
                    </DialogTitle>
                    <DialogDescription>
                        Link a task to one of your goals
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {/* Top: Goal & Priority (Flex with Priority on Right) */}
                    <div className="flex items-start gap-4">
                        {/* Goal */}
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="task-goal">Goal *</Label>
                            <Select
                                value={taskGoalId}
                                onValueChange={setTaskGoalId}
                            >
                                <SelectTrigger className="w-full">
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

                        {/* Priority */}
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select
                                value={taskPriority}
                                onValueChange={(v: "Low" | "Medium" | "High") => setTaskPriority(v)}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent align="end">
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

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
                        <Label htmlFor="task-description">
                            Description
                        </Label>
                        <DescriptionEditor
                            value={taskDescription}
                            onChange={setTaskDescription}
                            placeholder="Describe your task... Use - for lists, **text** for bold."
                        />
                    </div>

                    {/* Checklist Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Checklist</Label>
                            <Button type="button" variant="outline" size="sm" onClick={onAddChecklistItem} className="h-7 px-2 text-xs">
                                <Plus className="w-3 h-3 mr-1" /> Add Item
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {taskChecklist.map((item) => (
                                <div key={item.id} className="flex items-center gap-2">
                                    <Checkbox
                                        checked={item.completed}
                                        onCheckedChange={() => onToggleChecklistItem(item.id)}
                                    />
                                    <Input
                                        value={item.text}
                                        onChange={(e) => onUpdateChecklistItem(item.id, e.target.value)}
                                        placeholder="Checklist item"
                                        className="flex-1 h-8 text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onRemoveChecklistItem(item.id)}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button onClick={onSave}>
                            {editingTask ? "Update" : "Create"} Task
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

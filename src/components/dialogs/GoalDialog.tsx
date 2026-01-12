
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Goal } from "@/types";

interface GoalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // Form State
    title: string;
    setTitle: (value: string) => void;
    description: string;
    setDescription: (value: string) => void;
    color: string;
    setColor: (value: string) => void;
    // Actions
    onSave: () => void;
    onCancel: () => void;
    editingGoal: Goal | null;
}

export function GoalDialog({
    open,
    onOpenChange,
    title,
    setTitle,
    description,
    setDescription,
    color,
    setColor,
    onSave,
    onCancel,
    editingGoal
}: GoalDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {editingGoal ? "Edit Goal" : "Create New Goal"}
                    </DialogTitle>
                    <DialogDescription>
                        {editingGoal
                            ? "Update your goal details"
                            : "Set a new goal to track your progress"}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            placeholder="e.g., Learn React Native"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe your goal and why it matters..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="color">Color Category</Label>
                        <Select value={color} onValueChange={setColor}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a color" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="blue">Blue (Career/Learning)</SelectItem>
                                <SelectItem value="green">Green (Health/Wellness)</SelectItem>
                                <SelectItem value="purple">
                                    Purple (Creative/Hobbies)
                                </SelectItem>
                                <SelectItem value="orange">Orange (Social/Family)</SelectItem>
                                <SelectItem value="red">Red (Urgent/Important)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button onClick={onSave}>
                            {editingGoal ? "Update" : "Create"} Goal
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

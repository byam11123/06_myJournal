
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MarkdownDisplay } from "@/components/ui/markdown-display";
import { Edit, Calendar, Clock, CheckSquare, ImageIcon, Upload, X, Lightbulb, StickyNote } from "lucide-react";
import { Task } from "@/types";

interface TaskDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedTask: Task | null;
    onEdit: () => void;
    // Checklist
    onChecklistToggle: (taskId: string, itemId: string) => void;
    // Photos
    onAddPhoto: (taskId: string) => void;
    onRemovePhoto: (taskId: string, photoId: string) => void;
    onViewImage: (url: string) => void;
    // Learnings
    newLearning: string;
    setNewLearning: (value: string) => void;
    onAddLearning: (taskId: string) => void;
    // Notes
    newNote: string;
    setNewNote: (value: string) => void;
    onAddNote: (taskId: string) => void;
}

export function TaskDetailDialog({
    open,
    onOpenChange,
    selectedTask,
    onEdit,
    onChecklistToggle,
    onAddPhoto,
    onRemovePhoto,
    onViewImage,
    newLearning,
    setNewLearning,
    onAddLearning,
    newNote,
    setNewNote,
    onAddNote
}: TaskDetailDialogProps) {
    if (!selectedTask) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <DialogTitle>Task Details</DialogTitle>
                            <DialogDescription>{selectedTask.title}</DialogDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onEdit}
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
                                            onCheckedChange={() => onChecklistToggle(selectedTask.id, item.id)}
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
                                onClick={() => onAddPhoto(selectedTask.id)}
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
                                            onClick={() => onViewImage(photo.url)}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemovePhoto(selectedTask.id, photo.id);
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
                                    onAddLearning(selectedTask.id)
                                }
                            />
                            <Button
                                size="sm"
                                onClick={() => onAddLearning(selectedTask.id)}
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
                                    e.key === "Enter" && onAddNote(selectedTask.id)
                                }
                            />
                            <Button
                                size="sm"
                                onClick={() => onAddNote(selectedTask.id)}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@/types";

interface ProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUser: User | null;
    analytics: { totalTasks: number };
    onLogout: () => void;
}

export function ProfileDialog({
    open,
    onOpenChange,
    currentUser,
    analytics,
    onLogout
}: ProfileDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                onClick={onLogout}
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

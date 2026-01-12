
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface PhotoViewerProps {
    url: string | null;
    onClose: () => void;
}

export function PhotoViewer({ url, onClose }: PhotoViewerProps) {
    return (
        <Dialog open={!!url} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90 border-none shadow-2xl">
                <DialogTitle className="sr-only">Photo Viewer</DialogTitle>
                <div className="relative flex items-center justify-center min-h-[50vh] max-h-[90vh] w-full">
                    {url && (
                        <img
                            src={url}
                            alt="Full view"
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/80 transition-colors cursor-pointer z-50"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

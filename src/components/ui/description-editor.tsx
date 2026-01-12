import React from 'react';
import { Button } from './button';
import { Textarea } from './textarea';
import { Bold, List, Type } from 'lucide-react';

interface DescriptionEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function DescriptionEditor({ value, onChange, placeholder }: DescriptionEditorProps) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const insertFormat = (format: 'bold' | 'list') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end);
        const selection = text.substring(start, end);

        let newText = '';
        let newCursorPos = start;

        if (format === 'bold') {
            newText = `${before}**${selection || 'text'}**${after}`;
            newCursorPos = start + 2; // After **
        } else if (format === 'list') {
            // If we refer to a list, we ensure it starts on a new line if not already
            const prefix = before.endsWith('\n') || before === '' ? '- ' : '\n- ';
            newText = `${before}${prefix}${selection}${after}`;
            newCursorPos = start + prefix.length;
        }

        onChange(newText);

        // Restore focus and cursor (need timeout for React render)
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos + (selection.length));
        }, 0);
    };

    return (
        <div className="space-y-2 border rounded-md p-2 bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <div className="flex gap-1 border-b pb-2 mb-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertFormat('bold')}
                    title="Bold (**text**)"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertFormat('list')}
                    title="Bullet List (- item)"
                >
                    <List className="h-4 w-4" />
                </Button>
            </div>
            <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[100px] border-0 focus-visible:ring-0 p-0 resize-none shadow-none"
            />
        </div>
    );
}

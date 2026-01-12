import React from 'react';

interface MarkdownDisplayProps {
    content: string;
    className?: string;
}

export function MarkdownDisplay({ content, className = '' }: MarkdownDisplayProps) {
    if (!content) return null;

    // Simple parser
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    let currentList: React.ReactNode[] = [];

    const parseInline = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    lines.forEach((line, index) => {
        const isListItem = line.trim().startsWith('- ') || line.trim().startsWith('* ');

        if (isListItem) {
            const text = line.trim().substring(2);
            currentList.push(<li key={`li-${index}`}>{parseInline(text)}</li>);
        } else {
            // Flush list if exists
            if (currentList.length > 0) {
                elements.push(<ul key={`ul-${index}`} className="list-disc pl-5 my-2 space-y-1">{currentList}</ul>);
                currentList = [];
            }

            // Add text line (if not empty, or simple break)
            if (line.trim() === '') {
                // elements.push(<br key={`br-${index}`} />); // Optional: skip empty lines or add spacing
                // Just empty space
            } else {
                elements.push(<div key={`p-${index}`} className="min-h-[1.5em]">{parseInline(line)}</div>);
            }
        }
    });

    // Flush remaining list
    if (currentList.length > 0) {
        elements.push(<ul key={`ul-end`} className="list-disc pl-5 my-2 space-y-1">{currentList}</ul>);
    }

    return <div className={`text-sm text-muted-foreground ${className}`}>{elements}</div>;
}

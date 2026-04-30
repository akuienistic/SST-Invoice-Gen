import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface EditableTextProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  as?: "span" | "div" | "h1" | "h2" | "p";
}

export function EditableText({
  value,
  onChange,
  placeholder,
  multiline = false,
  className,
  as = "span",
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  const Tag = as as any;
  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onBlur={(e: React.FocusEvent<HTMLElement>) => onChange(e.currentTarget.innerText)}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
      }}
      className={cn(
        "outline-none rounded px-1 -mx-1 transition-colors",
        "hover:bg-muted/60 focus:bg-muted/80 focus:ring-2 focus:ring-foreground/10",
        "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60",
        "whitespace-pre-wrap break-words",
        className
      )}
    />
  );
}

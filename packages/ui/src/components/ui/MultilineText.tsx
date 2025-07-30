'use client';

interface MultilineTextProps {
  text: string;
  className?: string;
  lineClassName?: string;
  preserveWhitespace?: boolean;
}

export function MultilineText({
  text,
  className,
  lineClassName,
  preserveWhitespace = false,
}: MultilineTextProps) {
  const lines = text.split('\n');

  return (
    <div className={className}>
      {lines.map((line, index) => (
        <p
          key={index}
          className={lineClassName}
          style={preserveWhitespace ? { whiteSpace: 'pre-wrap' } : undefined}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

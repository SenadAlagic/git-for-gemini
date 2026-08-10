import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

// Component overrides are intentionally low-key: chat bubbles can have a
// primary, secondary, or muted background, so everything here relies on
// `currentColor`/opacity tweaks rather than fixed colors that might clash.
const components: Components = {
  p: ({ className, ...props }) => (
    <p
      className={cn("mb-2 last:mb-0 leading-relaxed", className)}
      {...props}
    />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn("underline underline-offset-2 hover:opacity-80", className)}
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-semibold", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn("mb-2 last:mb-0 list-disc space-y-1 pl-5", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn("mb-2 last:mb-0 list-decimal space-y-1 pl-5", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("leading-relaxed", className)} {...props} />
  ),
  h1: ({ className, ...props }) => (
    <h1
      className={cn("mt-3 mb-1.5 text-base font-semibold first:mt-0", className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn("mt-3 mb-1.5 text-base font-semibold first:mt-0", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn("mt-2 mb-1 text-sm font-semibold first:mt-0", className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "mb-2 last:mb-0 border-l-2 border-current/30 pl-3 opacity-90",
        className,
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("my-3 border-current/20", className)} {...props} />
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = /language-/.test(className ?? "");
    if (isBlock) {
      return (
        <code className={cn("font-mono text-[0.85em]", className)} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className={cn(
          "rounded bg-current/10 px-1 py-0.5 font-mono text-[0.85em]",
          className,
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "mb-2 last:mb-0 overflow-x-auto rounded-lg bg-current/10 p-2.5 text-[0.85em]",
        className,
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="mb-2 last:mb-0 overflow-x-auto">
      <table
        className={cn("w-full border-collapse text-left text-[0.9em]", className)}
        {...props}
      />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "border border-current/20 px-2 py-1 font-semibold",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td className={cn("border border-current/20 px-2 py-1", className)} {...props} />
  ),
};

type MarkdownContentProps = {
  children: string;
  className?: string;
};

export const MarkdownContent = ({ children, className }: MarkdownContentProps) => {
  return (
    <div className={cn("min-w-0", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
};

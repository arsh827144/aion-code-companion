import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

function CodeBlock({
  inline,
  className,
  children,
}: {
  inline?: boolean;
  className?: string;
  children?: any;
}) {
  const text = String(children ?? "").replace(/\n$/, "");
  if (inline) {
    return (
      <code className={cn("rounded bg-muted px-1 py-0.5 text-[0.925em]", className)}>{text}</code>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Code clipboard me copy ho gaya." });
    } catch {
      toast({ title: "Copy failed", description: "Clipboard permission allow karein." });
    }
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-md border bg-card">
      <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
        <span className="text-xs text-muted-foreground">code</span>
        <Button variant="ghost" size="sm" className="h-8" onClick={copy}>
          <Copy className="mr-2 h-4 w-4" /> Copy
        </Button>
      </div>
      <pre className="overflow-x-auto p-3 text-sm leading-relaxed">
        <code className={cn("whitespace-pre", className)}>{text}</code>
      </pre>
    </div>
  );
}

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-foreground prose-headings:scroll-mt-20 prose-pre:m-0 prose-pre:bg-transparent">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: (props: any) => (
            <CodeBlock inline={Boolean(props?.inline)} className={props?.className}>
              {props?.children}
            </CodeBlock>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

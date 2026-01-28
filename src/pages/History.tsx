import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loadConversations, deleteConversation, exportConversationMarkdown } from "@/lib/chat/storage";
import { Download, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HistoryPage() {
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const conversations = useMemo(() => {
    const all = loadConversations();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((c) => {
      if (c.title.toLowerCase().includes(q)) return true;
      return c.messages.some((m) => m.content.toLowerCase().includes(q));
    });
  }, [query, refreshKey]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl">Chat History</CardTitle>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" />
        </CardHeader>
        <CardContent className="grid gap-3">
          {conversations.length === 0 ? (
            <div className="text-sm text-muted-foreground">No saved chats.</div>
          ) : null}
          {conversations.map((c) => (
            <div key={c.id} className="flex flex-col gap-2 rounded-md border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(c.updatedAt).toLocaleString()} • {c.messages.length} messages
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      downloadText(`${c.title.replace(/\W+/g, "-")}.md`, exportConversationMarkdown(c));
                      toast({ title: "Exported", description: "Markdown file download ho gayi." });
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      deleteConversation(c.id);
                      setRefreshKey((k) => k + 1);
                      toast({ title: "Deleted", description: "Conversation delete ho gayi." });
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

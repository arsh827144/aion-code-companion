import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Square } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MarkdownMessage } from "@/components/app/MarkdownMessage";
import { TermuxPresets, type Preset } from "@/components/app/TermuxPresets";
import { streamChat, type ChatMode, type StreamMsg } from "@/lib/ai/stream-chat";
import type { ChatMessage, Conversation } from "@/lib/chat/types";
import { upsertConversation } from "@/lib/chat/storage";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function uid() {
  return crypto.randomUUID();
}

function suggestTitle(firstUserText: string) {
  const trimmed = firstUserText.trim().slice(0, 48);
  return trimmed.length ? trimmed : "New chat";
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { session, isLoading } = useAuthSession();
  const [conversation, setConversation] = useState<Conversation>(() => {
    const id = uid();
    return {
      id,
      title: "AION GPT Chat",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
  });

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [longMode, setLongMode] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    upsertConversation(conversation);
  }, [conversation]);

  useEffect(() => {
    if (!isLoading && !session) {
      navigate("/auth", { replace: true });
    }
  }, [isLoading, session, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages.length, isStreaming]);

  const streamMessages: StreamMsg[] = useMemo(() => {
    return conversation.messages.map((m) => ({ role: m.role, content: m.content }));
  }, [conversation.messages]);

  const appendMessage = (m: ChatMessage) => {
    setConversation((prev) => ({
      ...prev,
      title: prev.messages.length === 0 && m.role === "user" ? suggestTitle(m.content) : prev.title,
      updatedAt: Date.now(),
      messages: [...prev.messages, m],
    }));
  };

  const updateLastAssistant = (nextContent: string) => {
    setConversation((prev) => {
      const msgs = [...prev.messages];
      const last = msgs[msgs.length - 1];
      if (!last || last.role !== "assistant") return prev;
      msgs[msgs.length - 1] = { ...last, content: nextContent };
      return { ...prev, updatedAt: Date.now(), messages: msgs };
    });
  };

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  };

  const CONTINUE_TOKEN = "[[AION_CONTINUE]]";

  const shouldAutoContinue = (text: string) => {
    const trimmed = text.trimEnd();
    if (!trimmed) return false;
    if (trimmed.endsWith(CONTINUE_TOKEN)) return true;
    // If a code fence is left open, it's usually a sign the model got cut mid-output.
    const fenceCount = (trimmed.match(/```/g) ?? []).length;
    if (fenceCount % 2 === 1) return true;
    return false;
  };

  const send = async (text: string) => {
    if (!session?.access_token) {
      toast({ title: "Login required", description: "Pehle login karein." });
      navigate("/auth");
      return;
    }
    const messageText = text.trim();
    if (!messageText) return;
    if (messageText.length > 4000) {
      toast({ title: "Message too long", description: "4000 characters se chhota rakhein." });
      return;
    }

    if (isStreaming) stop();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: ChatMessage = { id: uid(), role: "user", content: messageText, createdAt: Date.now() };
    appendMessage(userMsg);
    setInput("");

    const assistantId = uid();
    appendMessage({ id: assistantId, role: "assistant", content: "", createdAt: Date.now() });
    setIsStreaming(true);

    let assistantSoFar = "";
    try {
      const mode: ChatMode = "quality";

      // First pass
      await streamChat({
        messages: [...streamMessages, { role: "user", content: messageText }],
        accessToken: session.access_token,
        mode,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          updateLastAssistant(assistantSoFar);
        },
        onDone: () => {},
        signal: controller.signal,
      });

      // Auto-continue pass(es) for very long outputs, while keeping a single assistant bubble.
      // We only continue when the model signals it (or looks cut mid-code).
      if (longMode) {
        let turns = 0;
        while (!controller.signal.aborted && shouldAutoContinue(assistantSoFar) && turns < 8) {
          turns += 1;
          // Remove the token if present, so it doesn't pollute the final output.
          assistantSoFar = assistantSoFar.replace(new RegExp(`${CONTINUE_TOKEN}\\s*$`), "").trimEnd();
          updateLastAssistant(assistantSoFar + "\n\n");

          const continuePrompt =
            "Continue EXACTLY from where you stopped. Do not repeat any earlier text. " +
            "If output may still be cut, end with " +
            CONTINUE_TOKEN +
            " on the final line.";

          await streamChat({
            messages: [...streamMessages, { role: "user", content: messageText }, { role: "assistant", content: assistantSoFar }, { role: "user", content: continuePrompt }],
            accessToken: session.access_token,
            mode,
            onDelta: (chunk) => {
              assistantSoFar += chunk;
              updateLastAssistant(assistantSoFar);
            },
            onDone: () => {},
            signal: controller.signal,
          });
        }
      }

      setIsStreaming(false);
      abortRef.current = null;
    } catch (e: any) {
      setIsStreaming(false);
      abortRef.current = null;
      if (e?.name === "AbortError") return;
      const status = e?.status as number | undefined;
      const msg = e?.message || "AI request failed";

      toast({
        title: status === 429 ? "Rate limited" : status === 402 ? "Credits required" : "Error",
        description: msg,
      });

      updateLastAssistant(
        `**Error:** ${msg}\n\nAap dubara try karein ya prompt ko chhota/specific banayein.`,
      );
    }
  };

  const onPickPreset = (preset: Preset) => {
    setInput(preset.prompt);
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="grid gap-4">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Chat</CardTitle>
            <TermuxPresets onPick={onPickPreset} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border bg-card">
              <ScrollArea className="h-[55vh]">
                <div className="space-y-4 p-4">
                  {conversation.messages.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Apna sawal likho ya preset select karo—main Termux commands + code ke saath guide karunga.
                    </div>
                  ) : null}

                  {conversation.messages.map((m) => (
                    <div key={m.id} className="grid gap-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        {m.role === "user" ? "You" : "AION GPT"}
                      </div>
                      <div className="rounded-md border bg-background p-3">
                        {m.role === "assistant" ? (
                          <MarkdownMessage content={m.content || (isStreaming ? "…" : "")} />
                        ) : (
                          <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
            </div>

            <div className="grid gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Termux me kya banana hai? (e.g., Node API scaffold)"
                className="min-h-[110px]"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-xs text-muted-foreground">Hindi answers • Commands/code English</div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="long-mode"
                      checked={longMode}
                      onCheckedChange={(v) => setLongMode(Boolean(v))}
                      disabled={isStreaming}
                    />
                    <Label htmlFor="long-mode" className="text-xs text-muted-foreground">
                      Long output (auto-continue)
                    </Label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isStreaming ? (
                    <Button variant="secondary" onClick={stop}>
                      <Square className="mr-2 h-4 w-4" /> Stop
                    </Button>
                  ) : null}
                  <Button
                    onClick={() => send(input)}
                    disabled={isStreaming || !input.trim()}
                  >
                    {isStreaming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

import type { Conversation } from "./types";

const STORAGE_KEY = "aion_gpt_conversations_v1";

function safeParse(json: string | null): Conversation[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Conversation[];
  } catch {
    return [];
  }
}

export function loadConversations(): Conversation[] {
  return safeParse(localStorage.getItem(STORAGE_KEY))
    .filter((c) => c && typeof c.id === "string" && Array.isArray(c.messages))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveConversations(next: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function upsertConversation(conversation: Conversation) {
  const all = loadConversations();
  const idx = all.findIndex((c) => c.id === conversation.id);
  const next = [...all];
  if (idx >= 0) next[idx] = conversation;
  else next.unshift(conversation);
  saveConversations(next);
}

export function deleteConversation(id: string) {
  const all = loadConversations();
  saveConversations(all.filter((c) => c.id !== id));
}

export function exportConversationMarkdown(c: Conversation): string {
  const lines: string[] = [];
  lines.push(`# ${c.title}`);
  lines.push("");
  for (const m of c.messages) {
    lines.push(`## ${m.role === "user" ? "User" : "AION GPT"}`);
    lines.push("");
    lines.push(m.content);
    lines.push("");
  }
  return lines.join("\n");
}

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export type Preset = { id: string; label: string; prompt: string };

export const TERMUX_PRESETS: Preset[] = [
  {
    id: "termux-setup",
    label: "Termux Setup",
    prompt:
      "Mujhe Termux ka first-time setup chahiye. Step-by-step commands do: update/upgrade, basic packages, storage permission, git setup, ssh keys, common errors & fixes.",
  },
  {
    id: "python-project",
    label: "Python Project",
    prompt:
      "Termux me ek Python project scaffold karao: venv, requirements, src layout, run command, lint/test basics, common errors & fixes.",
  },
  {
    id: "node-express",
    label: "Node/Express API",
    prompt:
      "Termux me Node + Express API project scaffold karao (TypeScript preferred). Folder structure, install commands, run/dev scripts, sample routes, env handling, common errors & fixes.",
  },
  {
    id: "react-vite",
    label: "React/Vite App",
    prompt:
      "Termux (Android) me React + Vite app start karne ka best approach batao. Commands, dev server, mobile browser testing, common issues & fixes.",
  },
  {
    id: "git-github",
    label: "Git + GitHub Push",
    prompt:
      "Termux me git + GitHub push ka full step-by-step guide do (SSH keys). Commands, verification, common auth errors & fixes.",
  },
  {
    id: "android-build-basics",
    label: "Android Build Basics",
    prompt:
      "Android/Termux limitations ke saath: build basics samjhao. Kya Termux me possible hai/nahin, best alternatives, and safe workflow.",
  },
];

export function TermuxPresets({ onPick }: { onPick: (preset: Preset) => void }) {
  return (
    <ScrollArea className="w-full">
      <div className="flex w-max gap-2 pb-2">
        {TERMUX_PRESETS.map((p) => (
          <Button key={p.id} variant="secondary" size="sm" onClick={() => onPick(p)}>
            {p.label}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

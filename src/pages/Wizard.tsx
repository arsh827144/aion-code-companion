import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

const featuresList = [
  { id: "auth", label: "Auth (basic)" },
  { id: "db", label: "DB (local/sqlite etc.)" },
  { id: "api", label: "External API" },
  { id: "tests", label: "Tests" },
  { id: "lint", label: "Lint/Format" },
] as const;

export default function WizardPage() {
  const [appType, setAppType] = useState<"cli" | "web" | "api" | "bot">("web");
  const [runtime, setRuntime] = useState<"python" | "node" | "go">("node");
  const [name, setName] = useState("my-app");
  const [desc, setDesc] = useState("");
  const [features, setFeatures] = useState<Record<string, boolean>>({});

  const prompt = useMemo(() => {
    const picked = featuresList.filter((f) => features[f.id]).map((f) => f.label);
    return [
      `Mujhe Termux me ek ${appType.toUpperCase()} app generate karni hai.`,
      `Runtime: ${runtime}.`,
      `Project name: ${name}.`,
      desc.trim() ? `Description: ${desc.trim()}` : "",
      picked.length ? `Features: ${picked.join(", ")}` : "",
      "Output required:",
      "1) Folder structure",
      "2) Files content (copy-paste)",
      "3) Exact Termux commands sequence (install, init, run)",
      "4) Verification steps",
      "5) Common errors & fixes",
    ]
      .filter(Boolean)
      .join("\n");
  }, [appType, runtime, name, desc, features]);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast({ title: "Copied", description: "Wizard prompt clipboard me copy ho gaya." });
    } catch {
      toast({ title: "Copy failed", description: "Clipboard permission allow karein." });
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">App Generator Wizard</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>App Type</Label>
              <Select value={appType} onValueChange={(v) => setAppType(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="cli">CLI</SelectItem>
                  <SelectItem value="bot">Bot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Runtime</Label>
              <Select value={runtime} onValueChange={(v) => setRuntime(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="node">Node</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Project name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="my-app" />
            </div>
            <div className="grid gap-2">
              <Label>Short description</Label>
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What should it do?" />
            </div>
          </div>

          <div className="grid gap-3">
            <Label>Features</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {featuresList.map((f) => (
                <label key={f.id} className="flex items-center gap-3 rounded-md border bg-card p-3">
                  <Checkbox
                    checked={!!features[f.id]}
                    onCheckedChange={(v) => setFeatures((p) => ({ ...p, [f.id]: Boolean(v) }))}
                  />
                  <span className="text-sm">{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Generated prompt (Chat me paste karein)</Label>
            <Textarea value={prompt} readOnly className="min-h-[220px]" />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={copyPrompt}>
                Copy prompt
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: Prompt copy karke Chat page me paste karein—wahan streaming output milega.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

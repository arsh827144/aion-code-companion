import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuthSession } from "@/lib/auth/useAuthSession";

const schema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6, "Password min 6 chars"),
});

export default function AuthPage() {
  const navigate = useNavigate();
  const { session, isLoading } = useAuthSession();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const title = useMemo(() => (mode === "login" ? "Login" : "Signup"), [mode]);

  if (!isLoading && session) {
    // already logged in
    navigate("/", { replace: true });
  }

  const submit = async () => {
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: "Invalid input", description: parsed.error.issues[0]?.message });
      return;
    }

    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Logged in", description: "Welcome back!" });
        navigate("/", { replace: true });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        toast({ title: "Account created", description: "Aap login kar sakte ho." });
        setMode("login");
      }
    } catch (e: any) {
      toast({ title: "Auth error", description: e?.message ?? "Failed" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-5xl items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">{title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Chat use karne ke liye login zaroori hai.
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="grid gap-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button onClick={submit} disabled={busy}>
            {busy ? "Please wait…" : title}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              className="text-primary underline"
              onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
              type="button"
            >
              {mode === "login" ? "New here? Signup" : "Already have an account? Login"}
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

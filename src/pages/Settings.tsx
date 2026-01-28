import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const clear = () => {
    localStorage.removeItem("aion_gpt_conversations_v1");
    toast({ title: "Cleared", description: "Local chat history clear ho gayi." });
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-sm text-muted-foreground">
            Abhi: Hindi by default. (Aage: theme/language toggles add kar sakte hain.)
          </div>
          <div>
            <Button variant="destructive" onClick={clear}>
              Clear local history
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

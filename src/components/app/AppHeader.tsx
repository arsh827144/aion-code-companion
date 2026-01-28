import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { Bot, History, Wand2, Settings } from "lucide-react";

const linkBase =
  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <NavLink
          to="/"
          className="inline-flex items-center gap-2 font-semibold"
          activeClassName=""
          pendingClassName=""
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            AION GPT
            <span className="block text-xs font-normal text-muted-foreground">Termux Coding Expert</span>
          </span>
        </NavLink>

        <nav className="flex items-center gap-1">
          <NavLink
            to="/wizard"
            className={linkBase}
            activeClassName="bg-accent text-accent-foreground"
          >
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">Wizard</span>
          </NavLink>
          <NavLink
            to="/history"
            className={linkBase}
            activeClassName="bg-accent text-accent-foreground"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={cn(linkBase, "pr-2")}
            activeClassName="bg-accent text-accent-foreground"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// Two states, not three: the icon shows the appearance you are looking at and
// one click always flips it, so the button never lands on an invisible stop.
export function ModeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  const toggle = () => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "light" : "dark"
    );
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn("btn btn-ghost btn-sm h-9 w-9 shrink-0 px-0", className)}
    >
      <Sun aria-hidden className="hidden h-[18px] w-[18px] dark:block" />
      <Moon aria-hidden className="block h-[18px] w-[18px] dark:hidden" />
    </button>
  );
}

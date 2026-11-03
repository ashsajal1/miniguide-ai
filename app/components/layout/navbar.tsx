"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, Menu, Plus, UserRound, X } from "lucide-react";
import { ModeToggle } from "../ui/mode-toggle";
import { SignedOut, SignInButton, SignedIn, UserAvatar } from "@clerk/nextjs";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/course" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer on navigation
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-rule bg-paper transition-shadow duration-300",
        scrolled && "shadow-[0_16px_32px_-28px_var(--color-shade)]"
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-3 focus:z-[60] focus:rounded-[10px] focus:border focus:border-rule focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-[var(--shadow-card)]"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-[4.5rem] max-w-[1240px] items-center justify-between gap-3 px-5 sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
        <Link
          href="/"
          aria-label="MiniGuide home"
          className="flex shrink-0 items-center gap-2.5 rounded-[10px] lg:justify-self-start"
        >
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-accent font-display text-[13px] font-medium tracking-tight text-accent-ink shadow-[inset_0_1px_0_var(--color-glint),0_2px_0_var(--color-accent-deep)]">
            MG
          </span>
          <span className="font-display text-[19px] font-bold tracking-[-0.03em] text-foreground">
            MiniGuide
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden h-full items-center justify-center md:flex"
        >
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-full items-center px-3 text-[15px] transition-colors duration-200",
                  active
                    ? "font-medium text-foreground"
                    : "text-ink-2 hover:text-foreground"
                )}
              >
                {item.name}
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-accent"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 lg:justify-end">
          <ModeToggle />
          <div className="hidden items-center gap-1.5 md:flex">
            <span
              aria-hidden
              className="mx-1.5 hidden h-5 w-px bg-rule lg:block"
            />
            <Link
              href="/course/create"
              prefetch={false}
              aria-label="Create course"
              title="Create course"
              className="btn btn-primary btn-sm h-9 w-9 shrink-0 px-0 lg:w-auto lg:px-[0.85rem]"
            >
              <Plus className="h-4 w-4" aria-hidden />
              <span className="hidden lg:inline">Create course</span>
            </Link>
            <SignedOut>
              <SignInButton>
                <button className="btn btn-outline btn-sm gap-1.5">
                  <LogIn className="h-4 w-4" aria-hidden />
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/profile"
                aria-label="My profile"
                title="My profile"
                className="rounded-full outline-offset-2 transition-shadow hover:shadow-[0_0_0_2px_var(--color-accent-soft)]"
              >
                <UserAvatar />
              </Link>
            </SignedIn>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm h-9 w-9 px-0 md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </div>
      </div>

      {/* Mobile drawer - Radix Dialog Primitive (right sheet) */}
      <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-shade/35 animate-fade-in" />
          <DialogPrimitive.Content
            className="fixed inset-y-0 right-0 z-50 flex w-[86vw] max-w-[320px] flex-col border-l border-rule bg-paper shadow-[var(--shadow-lift)] outline-none md:hidden animate-sheet-in"
            aria-describedby={undefined}
          >
            <DialogPrimitive.Title className="sr-only">
              Navigation menu
            </DialogPrimitive.Title>

            <div className="flex shrink-0 items-center justify-between border-b border-rule px-5 py-3.5">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5"
              >
                <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-accent font-display text-[12px] font-medium text-accent-ink shadow-[inset_0_1px_0_var(--color-glint),0_2px_0_var(--color-accent-deep)]">
                  MG
                </span>
                <span className="font-display text-[18px] font-bold tracking-[-0.03em]">
                  MiniGuide
                </span>
              </Link>
              <button
                type="button"
                className="btn btn-ghost btn-sm h-9 w-9 px-0"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-[18px] w-[18px]" aria-hidden />
              </button>
            </div>

            <nav aria-label="Primary" className="flex-1 overflow-y-auto px-5 py-5">
              <p className="dose text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Contents
              </p>
              <ul className="mt-2 border-y border-rule">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li
                      key={item.href}
                      className="border-b border-rule last:border-b-0"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between py-3.5 text-[15px] transition-colors",
                          active
                            ? "font-medium text-foreground"
                            : "text-ink-2 hover:text-foreground"
                        )}
                      >
                        {item.name}
                        {active && (
                          <span
                            aria-hidden
                            className="h-[2px] w-6 rounded-full bg-accent"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="shrink-0 space-y-2 border-t border-rule p-5">
              <Link
                href="/course/create"
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className="btn btn-primary w-full gap-1.5"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Create course
              </Link>
              <SignedOut>
                <SignInButton>
                  <button className="btn btn-outline w-full gap-1.5">
                    <LogIn className="h-4 w-4" aria-hidden />
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-outline w-full justify-start gap-1.5"
                >
                  <UserRound className="h-4 w-4" aria-hidden />
                  My profile
                </Link>
              </SignedIn>
            </div>

            <div className="shrink-0 border-t border-rule px-5 py-3">
              <span className="dose text-[10px] text-muted-foreground">
                © {new Date().getFullYear()} MiniGuide AI
              </span>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </header>
  );
}

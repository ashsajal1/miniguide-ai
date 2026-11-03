import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="grid flex-1 place-items-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-accent font-display text-[13px] font-bold text-accent-ink">
                MG
              </span>
              <span className="font-display text-xl font-bold tracking-[-0.03em]">
                MiniGuide
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              A short course is a good place to start.
            </p>
          </div>
          <div className="rounded-[14px] border border-rule bg-card p-2 shadow-[var(--shadow-card)]">
            <div className="overflow-hidden rounded-[10px]">{children}</div>
          </div>
        </div>
      </main>

      <div className="p-6 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

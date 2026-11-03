'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <p className="text-[11px] text-muted-foreground">Error</p>
        <h1 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] text-foreground">
          Something went wrong.
        </h1>

        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          An unexpected error stopped this page. Trying again usually settles it.
        </p>

        <div className="mt-6 rounded-[10px] border border-rule bg-paper-2 p-4">
          <p className="font-mono text-[12px] text-ink-2">
            {error.message || 'An unknown error occurred'}
          </p>
          {error.digest && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Reference {error.digest}
            </p>
          )}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button onClick={reset} className="btn btn-primary gap-2" aria-label="Try again">
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </button>

          <Link href="/" className="btn btn-outline gap-2">
            <Home className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
        </div>

        <div className="mt-12 border-t border-rule pt-6">
          <p className="mb-3 text-sm text-muted-foreground">
            If the problem persists, contact support.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/contact" className="font-medium text-accent-deep hover:underline">
              Contact support
            </Link>
            <a href="mailto:support@minicourse.com" className="font-medium text-accent-deep hover:underline">
              support@minicourse.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

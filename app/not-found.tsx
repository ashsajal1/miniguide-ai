import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <p className="font-mono text-[clamp(4rem,10vw,7rem)] leading-none font-medium text-paper-3 select-none">
          404
        </p>
        <h1 className="mt-2 text-[clamp(1.9rem,3.6vw,2.8rem)] text-foreground">
          This page isn&apos;t here.
        </h1>
        <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-muted-foreground">
          The page you were looking for may have moved, or the link may be out of date.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
          <Link href="/course" className="btn btn-outline gap-2">
            <BookOpen className="h-4 w-4" aria-hidden />
            Browse courses
          </Link>
        </div>

        <div className="mt-10 border-t border-rule pt-6">
          <p className="mb-3 text-sm text-muted-foreground">Looking for something else?</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/faq" className="font-medium text-accent-deep hover:underline">
              FAQ
            </Link>
            <Link href="/support" className="font-medium text-accent-deep hover:underline">
              Support
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-1.5 font-medium text-accent-deep hover:underline">
              Contact us
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

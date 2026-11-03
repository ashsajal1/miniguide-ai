export default function Loading() {
  return (
    <div className="mx-auto max-w-[1080px] animate-pulse px-5 py-10 sm:px-8" aria-hidden="true">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-[14px] border border-rule bg-card p-5">
          <div className="aspect-video rounded-[10px] bg-paper-3"></div>
          <div className="mt-6 space-y-3">
            <div className="h-7 w-3/4 rounded-[10px] bg-paper-3"></div>
            <div className="h-4 w-1/2 rounded-full bg-paper-2"></div>
            <div className="h-2.5 w-full rounded-full bg-paper-2"></div>
          </div>
        </div>
        <div className="rounded-[14px] border border-rule bg-card p-5">
          <div className="mb-4 h-5 w-32 rounded-full bg-paper-3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded-[8px] bg-paper-2"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

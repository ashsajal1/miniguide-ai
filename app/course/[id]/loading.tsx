export default function Loading() {
  return (
    <div className="mx-auto max-w-[1240px] animate-pulse space-y-8 px-5 py-10 sm:px-8" aria-hidden="true">
      <div className="space-y-4">
        <div className="h-8 w-3/4 rounded-[10px] bg-paper-3"></div>
        <div className="h-4 w-1/2 rounded-full bg-paper-2"></div>
        <div className="flex items-center gap-4 pt-2">
          <div className="h-10 w-10 rounded-full bg-paper-3"></div>
          <div className="h-4 w-28 rounded-full bg-paper-2"></div>
          <div className="h-4 w-28 rounded-full bg-paper-2"></div>
        </div>
      </div>
      <div className="aspect-[16/6] w-full rounded-[14px] bg-paper-3"></div>
      <div className="space-y-3">
        <div className="h-6 w-1/3 rounded-full bg-paper-3"></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 w-full rounded-full bg-paper-2"></div>
        ))}
      </div>
    </div>
  );
}

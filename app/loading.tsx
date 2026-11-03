export default function Loading() {
  return (
    <div className="mx-auto max-w-[1240px] animate-pulse p-5 md:p-8" aria-hidden="true">
      <div className="mb-8 space-y-3">
        <div className="h-9 w-72 rounded-[10px] bg-paper-3"></div>
        <div className="h-4 w-56 rounded-full bg-paper-2"></div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[14px] border border-rule bg-card">
            <div className="aspect-video w-full bg-paper-3"></div>
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 rounded-full bg-paper-3"></div>
              <div className="h-4 w-1/2 rounded-full bg-paper-2"></div>
              <div className="flex items-center justify-between pt-2">
                <div className="h-3 w-20 rounded-full bg-paper-2"></div>
                <div className="h-6 w-16 rounded-full bg-paper-2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

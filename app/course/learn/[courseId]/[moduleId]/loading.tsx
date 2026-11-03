export default function Loading() {
  return (
    <div
      className="flex min-h-dvh flex-col md:flex-row"
      aria-hidden="true"
    >
      <div className="hidden w-[19rem] shrink-0 border-r border-rule bg-paper md:block">
        <div className="animate-pulse border-b border-rule px-4 py-5">
          <div className="h-3 w-24 rounded-full bg-paper-3"></div>
          <div className="mt-4 h-3 w-16 rounded-full bg-paper-2"></div>
          <div className="mt-2 h-6 w-40 rounded-[8px] bg-paper-3"></div>
        </div>
        <div className="animate-pulse space-y-2 px-4 py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-11 rounded-[10px] bg-paper-2"></div>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="h-[3.75rem] border-b border-rule bg-paper"></div>
        <div className="mx-auto w-full max-w-[60rem] px-4 pb-14 pt-7 sm:px-6 sm:pb-16 sm:pt-9 lg:px-8">
          <div className="learn-deck mt-6 animate-pulse md:mt-10">
            <div className="learn-card">
              <div className="learn-card-label">
                <div className="h-5 w-28 rounded-full bg-paper-3"></div>
                <div className="h-3 w-10 rounded-full bg-paper-2"></div>
              </div>
              <div className="learn-card-body">
                <div className="h-9 w-2/3 rounded-[8px] bg-paper-3"></div>
                <div className="mt-7 space-y-3">
                  <div className="h-4 w-full rounded-full bg-paper-2"></div>
                  <div className="h-4 w-11/12 rounded-full bg-paper-2"></div>
                  <div className="h-4 w-4/5 rounded-full bg-paper-2"></div>
                  <div className="h-4 w-2/3 rounded-full bg-paper-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
      
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between p-4 md:px-8 bg-white/70 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse"></div>
          <div className="h-8 w-32 bg-slate-200 rounded-md animate-pulse"></div>
        </div>
        <div className="flex items-center gap-6">
          <div className="h-6 w-16 bg-slate-200 rounded-md animate-pulse hidden md:block"></div>
          <div className="h-6 w-20 bg-slate-200 rounded-md animate-pulse hidden md:block"></div>
          <div className="h-10 w-32 bg-blue-100 rounded-full animate-pulse"></div>
        </div>
      </header>

      {/* Hero Skeleton */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 max-w-6xl mx-auto w-full">
        <div className="h-6 w-48 bg-blue-100 rounded-full mb-8 animate-pulse"></div>
        
        <div className="space-y-4 w-full flex flex-col items-center mb-10">
          <div className="h-14 md:h-20 w-3/4 max-w-2xl bg-slate-200 rounded-xl animate-pulse"></div>
          <div className="h-14 md:h-20 w-1/2 max-w-lg bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
        
        <div className="space-y-3 w-full flex flex-col items-center mb-12">
          <div className="h-6 w-full max-w-3xl bg-slate-200 rounded-md animate-pulse"></div>
          <div className="h-6 w-5/6 max-w-2xl bg-slate-200 rounded-md animate-pulse"></div>
          <div className="h-6 w-2/3 max-w-xl bg-slate-200 rounded-md animate-pulse"></div>
        </div>
        
        <div className="h-14 w-56 bg-blue-100 rounded-2xl animate-pulse mb-24"></div>

        {/* Features Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl mb-6 animate-pulse"></div>
              <div className="h-6 w-3/4 bg-slate-200 rounded-md mb-4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-slate-100 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
      
    </div>
  );
}

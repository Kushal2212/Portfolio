export default function PublicLoading() {
  return (
    <div className="container-page pt-32 sm:pt-40" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page…</span>
      <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted" />
      <div className="mt-6 space-y-3">
        <div className="h-12 w-3/4 max-w-xl animate-pulse rounded-2xl bg-muted sm:h-16" />
        <div className="h-12 w-1/2 max-w-md animate-pulse rounded-2xl bg-muted sm:h-16" />
      </div>
      <div className="mt-6 h-4 w-full max-w-lg animate-pulse rounded-full bg-muted" />
      <div className="mt-4 h-4 w-2/3 max-w-md animate-pulse rounded-full bg-muted" />

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-2xl border border-border bg-card p-5">
            <div className="aspect-[16/10] animate-pulse rounded-xl bg-muted" />
            <div className="mt-5 h-4 w-2/3 animate-pulse rounded-full bg-muted" />
            <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-muted" />
            <div className="mt-2 h-3 w-4/5 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

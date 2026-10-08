export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20" role="status" aria-label="Loading">
      <div className="h-12 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="mt-6 h-6 w-80 max-w-full animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

export default function AdminLoading() {
  return (
    <div role="status" aria-label="Loading admin workspace" className="space-y-6 animate-pulse">
      <div className="h-12 w-64 rounded-xl bg-muted" />
      <div className="h-64 rounded-3xl bg-muted" />
    </div>
  );
}

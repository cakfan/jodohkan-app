export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Status CV</div>
          <div className="text-2xl font-bold">Aktif</div>
        </div>
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Request Ta'aruf</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Proses Berjalan</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Mediator</div>
          <div className="text-2xl font-bold">Belum Ada</div>
        </div>
      </div>
    </div>
  );
}

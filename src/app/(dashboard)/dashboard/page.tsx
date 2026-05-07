export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <div className="text-muted-foreground text-sm font-medium">Status CV</div>
          <div className="text-2xl font-bold">Aktif</div>
        </div>
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <div className="text-muted-foreground text-sm font-medium">Request Ta&apos;aruf</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <div className="text-muted-foreground text-sm font-medium">Proses Berjalan</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <div className="text-muted-foreground text-sm font-medium">Mediator</div>
          <div className="text-2xl font-bold">Belum Ada</div>
        </div>
      </div>
    </div>
  );
}

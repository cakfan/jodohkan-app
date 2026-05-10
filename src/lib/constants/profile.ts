export const CV_STATUS_LABELS: Record<string, { label: string; class: string; dot?: string }> = {
  draft: { label: "Draft", class: "text-muted-foreground", dot: "bg-muted-foreground" },
  pending: { label: "Menunggu Review", class: "text-amber-600", dot: "bg-amber-600" },
  approved: { label: "Disetujui", class: "text-emerald-600", dot: "bg-emerald-600" },
  published: { label: "Published", class: "text-emerald-600", dot: "bg-emerald-600" },
  rejected: { label: "Ditolak", class: "text-red-600", dot: "bg-red-600" },
};

export const MARITAL_LABELS: Record<string, string> = {
  single: "Belum Menikah",
  divorced: "Pernah Menikah",
  widowed: "Cerai Meninggal",
};

export function getMaritalLabel(status: string | null | undefined): string {
  if (!status) return "-";
  return MARITAL_LABELS[status] || status;
}

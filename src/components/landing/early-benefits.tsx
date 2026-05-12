import { Star, ShieldCheck, Clock } from "lucide-react";

const benefits = [
  {
    icon: Star,
    title: "Profil Lebih Mudah Ditemukan",
    description:
      "Database masih kecil — kandidat yang cocok lebih mudah melihat profilmu di antara sedikit pesaing.",
  },
  {
    icon: ShieldCheck,
    title: "Komunitas yang Terkurasi",
    description:
      "Anggota awal diseleksi lebih ketat. Kamu akan bertemu orang-orang yang betul-betul serius.",
  },
  {
    icon: Clock,
    title: "Akses Fitur Premium Gratis",
    description:
      "Member pertama mendapat akses penuh tanpa biaya selama masa early access berlangsung.",
  },
];

export function EarlyBenefitsSection() {
  return (
    <section className="pt-2 pb-12 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <h2 className="font-heading text-3xl font-medium tracking-tight md:text-4xl">
            Keuntungan Bergabung Sekarang
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Bergabung sekarang berarti kamu dapat yang tidak akan tersedia nanti.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-secondary bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                <benefit.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-bold">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

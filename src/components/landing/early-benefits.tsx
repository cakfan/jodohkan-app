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
    <section className="px-4 pt-2 pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="font-heading text-3xl font-medium tracking-tight md:text-4xl">
            Keuntungan Bergabung Sekarang
          </h2>
          <p className="text-foreground/80 mx-auto max-w-2xl text-lg">
            Bergabung sekarang berarti kamu dapat yang tidak akan tersedia nanti.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="border-secondary bg-card rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="bg-accent/15 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <benefit.icon className="text-accent h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold">{benefit.title}</h3>
              <p className="text-card-foreground/80 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { BookOpen, MessageSquare, UserCheck, Wallet } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "CV Ta'aruf Digital",
    description:
      "Buat profil lengkap yang mencakup visi-misi, pemahaman agama, dan kriteria pasangan dengan format yang terstruktur.",
  },
  {
    icon: UserCheck,
    title: "Algoritma Matching",
    description:
      "Temukan kandidat yang sesuai berdasarkan kriteria agama, usia, lokasi, dan visi hidup tanpa fitur swipe.",
  },
  {
    icon: MessageSquare,
    title: "Chat dengan Mediator",
    description:
      "Komunikasi tidak pernah berduaan. Setiap sesi chat didampingi oleh mediator yang terverifikasi.",
  },
  {
    icon: Wallet,
    title: "Sistem Token Niat",
    description:
      "Menjamin keseriusan proses ta'aruf. Token digunakan untuk verifikasi dan membuka sesi ta'aruf.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-muted/30 py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-heading text-3xl font-medium tracking-tight md:text-4xl">
            Mengapa Jodohkan?
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Dibangun dengan prinsip privacy first dan mengikuti kaidah syar&apos;i
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card text-card-foreground rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Eye, MessageSquare, BookOpen, Heart, Home } from "lucide-react";

const steps = [
  {
    icon: BookOpen,
    step: "01",
    title: "Pembuatan CV",
    description:
      "Isi profil lengkap dan saling membaca CV tanpa foto terlebih dahulu.",
  },
  {
    icon: Eye,
    step: "02",
    title: "Nazhar",
    description:
      "Saling melihat foto atau bertemu langsung didampingi mediator.",
  },
  {
    icon: Heart,
    step: "03",
    title: "Istikharah",
    description: "Waktu tenang untuk meminta petunjuk kepada Allah سُبْحَانَهُ وَتَعَالَىٰ.",
  },
  {
    icon: MessageSquare,
    step: "04",
    title: "Khitbah",
    description: "Pemberitahuan bahwa proses berlanjut ke tahap lamaran.",
  },
  {
    icon: Home,
    step: "05",
    title: "Menikah",
    description: "Akun dinonaktifkan setelah mendapatkan pasangan yang halal.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Tahapan Ta&apos;aruf
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Proses yang terstruktur dan transparan menuju pernikahan
          </p>
        </div>

        <div className="relative grid gap-12 md:grid-cols-5 md:gap-4">
          <div className="bg-primary/20 absolute left-[10%] right-[10%] top-12 z-0 hidden h-0.5 md:block" />

          {steps.map((step, index) => (
            <div
              key={step.step}
              className="group relative z-10 flex flex-col items-center gap-4 text-center md:transition-transform md:duration-300 md:hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-card border-primary/20 group-hover:border-primary/40 group-hover:shadow-md flex h-24 w-24 items-center justify-center rounded-2xl border shadow-sm transition-all duration-300">
                <step.icon className="text-primary h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
              </div>

              <div className="space-y-1 transition-colors duration-300">
                <h3 className="text-base font-bold group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

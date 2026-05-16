import { IdCard, Users, Lock } from "lucide-react";

const trusts = [
  {
    icon: IdCard,
    text: "Setiap profil diverifikasi KTP secara manual",
  },
  {
    icon: Users,
    text: "Tim mediator berlatar pendidikan agama Islam",
  },
  {
    icon: Lock,
    text: "Data pribadi tidak pernah dibagikan ke pihak ketiga",
  },
];

export function TrustSection() {
  return (
    <section className="bg-muted/50 py-8 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="hidden items-center justify-center gap-0 md:flex">
          {trusts.map((item, index) => (
            <div key={item.text} className="flex items-center">
              {index > 0 && <span className="mx-4 text-[13px] text-primary dark:text-primary-foreground">·</span>}
              <item.icon size={16} className="shrink-0 text-primary dark:text-primary-foreground" />
              <span className="ml-2 text-[13px] font-medium text-foreground">
                {item.text}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 md:hidden">
          {trusts.map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-left">
              <item.icon size={16} className="shrink-0 text-primary dark:text-primary-foreground" />
              <span className="text-[13px] font-medium text-foreground">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

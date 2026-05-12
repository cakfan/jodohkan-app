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
    <section className="bg-[#EDE0DC] py-8 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="hidden items-center justify-center gap-0 md:flex">
          {trusts.map((item, index) => (
            <div key={item.text} className="flex items-center">
              {index > 0 && <span className="mx-4 text-[13px] text-[#7D3E52]">·</span>}
              <item.icon size={16} className="shrink-0 text-[#7D3E52]" />
              <span className="ml-2 text-[13px] font-[500] text-[#2D1A20]">
                {item.text}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 md:hidden">
          {trusts.map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-left">
              <item.icon size={16} className="shrink-0 text-[#7D3E52]" />
              <span className="text-[13px] font-[500] text-[#2D1A20]">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

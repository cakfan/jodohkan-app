import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CTASection() {
  return (
    <section className="bg-primary py-24 px-4 text-center">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
            Siap Memulai Perjalanan?
          </h2>
          <p className="text-primary-foreground/80 mx-auto max-w-2xl text-lg">
            Bergabunglah dengan ribuan muslim dan muslimah yang mencari
            pasangan hidup melalui proses yang terjaga dan penuh berkah.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-primary-foreground text-primary gap-2 rounded-full px-8 text-base font-semibold hover:bg-primary-foreground/90"
            )}
          >
            Daftar Sekarang
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

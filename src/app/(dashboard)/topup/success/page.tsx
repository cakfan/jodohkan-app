import Link from "next/link";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default function TopUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Pembayaran Berhasil</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Token akan ditambahkan ke saldo Anda dalam beberapa saat.
            </p>
          </div>
          <Link href="/topup" className={cn(buttonVariants(), "mt-2")}>
            <ArrowLeft className="mr-2 size-4" />
            Kembali ke Top-Up
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

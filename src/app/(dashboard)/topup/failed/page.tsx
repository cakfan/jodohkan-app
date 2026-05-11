import Link from "next/link";
import { XCircle, RefreshCw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default function TopUpFailedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <XCircle className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Pembayaran Gagal</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Pembayaran Anda tidak berhasil. Silakan coba lagi.
            </p>
          </div>
          <Link href="/topup" className={cn(buttonVariants(), "mt-2")}>
            <RefreshCw className="mr-2 size-4" />
            Coba Lagi
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

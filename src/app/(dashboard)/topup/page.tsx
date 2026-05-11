"use client";

import { useState, useEffect } from "react";
import { createTopUpSession, getWalletBalance } from "@/app/actions/topup";
import { TOPUP_OPTIONS } from "@/lib/constants/topup";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TopUpPage() {
  const [selectedNominal, setSelectedNominal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const result = await getWalletBalance();
      if (result && "balance" in result) {
        setBalance(result.balance as number);
      }
    })();
  }, []);

  const handleBayar = async () => {
    if (!selectedNominal) return;
    setLoading(true);
    setError("");

    const result = await createTopUpSession(selectedNominal);
    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if ("checkoutUrl" in result && result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 md:p-6">
      {balance !== null && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Coins className="size-5 text-amber-500" />
            <div>
              <p className="text-muted-foreground text-xs">Saldo Token</p>
              <p className="text-lg font-bold">{balance} Token</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold">Pilih Nominal</h2>
        <div className="grid grid-cols-2 gap-3">
          {TOPUP_OPTIONS.map((opt) => (
            <button
              key={opt.nominal}
              type="button"
              onClick={() => setSelectedNominal(opt.nominal)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border p-5 text-center transition-all",
                "hover:border-primary hover:shadow-sm",
                selectedNominal === opt.nominal
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card"
              )}
            >
              <span className="text-lg font-bold">{opt.label}</span>
              <span className="text-muted-foreground text-sm">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      <Button
        size="lg"
        disabled={!selectedNominal || loading}
        onClick={handleBayar}
        className="w-full"
      >
        {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
        {loading ? "Memproses..." : "Bayar"}
      </Button>
    </div>
  );
}

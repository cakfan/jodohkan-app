"use server";

import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import { wallet, payment } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createTopUpInvoice } from "@/lib/xendit";
import { TOPUP_OPTIONS } from "@/lib/constants/topup";

export async function getWalletBalance() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { error: "Sesi tidak ditemukan." };
  }

  const existing = await db.query.wallet.findFirst({
    where: eq(wallet.userId, session.user.id),
    columns: { balance: true },
  });

  if (existing) {
    return { balance: existing.balance };
  }

  await db.insert(wallet).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    balance: 0,
  });

  return { balance: 0 };
}

function getTokensForNominal(nominal: number): number {
  const option = TOPUP_OPTIONS.find((o) => o.nominal === nominal);
  if (!option) throw new Error("Nominal tidak valid");
  return option.tokens;
}

export async function createTopUpSession(nominal: number) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { error: "Sesi tidak ditemukan." };
  }

  const tokens = getTokensForNominal(nominal);
  const externalId = `topup-${session.user.id}-${Date.now()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const paymentId = crypto.randomUUID();

  try {
    await db.insert(payment).values({
      id: paymentId,
      userId: session.user.id,
      externalId,
      amount: nominal,
      tokens,
      status: "pending",
    });

    const xenditInvoice = await createTopUpInvoice({
      externalId,
      amount: nominal,
      payerEmail: session.user.email ?? undefined,
      description: `Top-up ${tokens} Token Pethuk Jodoh`,
      successRedirectUrl: `${appUrl}/topup/success?external_id=${externalId}`,
      failureRedirectUrl: `${appUrl}/topup/failed?external_id=${externalId}`,
    });

    await db
      .update(payment)
      .set({
        xenditInvoiceId: xenditInvoice.id ?? null,
        xenditCheckoutUrl: xenditInvoice.invoiceUrl ?? null,
        expiredAt: xenditInvoice.expiryDate ?? null,
      })
      .where(eq(payment.id, paymentId));

    return { checkoutUrl: xenditInvoice.invoiceUrl, paymentId };
  } catch (error) {
    await db
      .update(payment)
      .set({ status: "failed" })
      .where(eq(payment.id, paymentId));

    const message = error instanceof Error ? error.message : "Gagal membuat pembayaran";
    return { error: message };
  }
}

export async function getPaymentStatus(externalId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { error: "Sesi tidak ditemukan." };
  }

  const result = await db.query.payment.findFirst({
    where: eq(payment.externalId, externalId),
    columns: { status: true, tokens: true },
  });

  if (!result) {
    return { error: "Pembayaran tidak ditemukan." };
  }

  return { status: result.status, tokens: result.tokens };
}

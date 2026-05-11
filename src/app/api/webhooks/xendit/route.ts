import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payment, wallet, tokenTransaction } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyWebhookToken } from "@/lib/xendit";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-callback-token");
  if (!verifyWebhookToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id: xenditInvoiceId, external_id, status, paid_at } = body;

    if (!external_id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingPayment = await db.query.payment.findFirst({
      where: eq(payment.externalId, external_id),
    });

    if (!existingPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (existingPayment.status === "paid") {
      return NextResponse.json({ message: "Already processed" });
    }

    if (status === "PAID" || status === "SETTLED") {
      await db.transaction(async (tx) => {
        await tx
          .update(payment)
          .set({
            status: "paid",
            xenditInvoiceId: xenditInvoiceId ?? existingPayment.xenditInvoiceId,
            paidAt: paid_at ? new Date(paid_at) : new Date(),
          })
          .where(eq(payment.id, existingPayment.id));

        const existingWallet = await tx.query.wallet.findFirst({
          where: eq(wallet.userId, existingPayment.userId),
        });

        if (existingWallet) {
          await tx
            .update(wallet)
            .set({
              balance: existingWallet.balance + existingPayment.tokens,
              updatedAt: new Date(),
            })
            .where(eq(wallet.userId, existingPayment.userId));
        } else {
          await tx.insert(wallet).values({
            id: crypto.randomUUID(),
            userId: existingPayment.userId,
            balance: existingPayment.tokens,
          });
        }

        await tx.insert(tokenTransaction).values({
          id: crypto.randomUUID(),
          userId: existingPayment.userId,
          type: "topup",
          amount: existingPayment.tokens,
          description: `Top-up ${existingPayment.tokens} Token`,
          referenceId: external_id,
        });
      });
    } else if (status === "EXPIRED") {
      await db
        .update(payment)
        .set({ status: "expired" })
        .where(eq(payment.id, existingPayment.id));
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

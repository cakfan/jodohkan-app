import { Invoice } from "xendit-node/invoice";

let _invoiceClient: Invoice | null = null;

function getInvoiceClient(): Invoice {
  if (_invoiceClient) return _invoiceClient;

  const secretKey = process.env.XENDIT_SECRET_KEY;
  if (!secretKey) {
    throw new Error("XENDIT_SECRET_KEY belum diset");
  }

  _invoiceClient = new Invoice({ secretKey });
  return _invoiceClient;
}

export interface CreateInvoiceParams {
  externalId: string;
  amount: number;
  payerEmail?: string;
  description?: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
}

export async function createTopUpInvoice(params: CreateInvoiceParams) {
  const client = getInvoiceClient();
  return client.createInvoice({
    data: {
      externalId: params.externalId,
      amount: params.amount,
      payerEmail: params.payerEmail,
      description: params.description,
      successRedirectUrl: params.successRedirectUrl,
      failureRedirectUrl: params.failureRedirectUrl,
      invoiceDuration: 86400,
      currency: "IDR",
    },
  });
}

export function verifyWebhookToken(token: string | null): boolean {
  if (!token) return false;
  const expected = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN;
  if (!expected) {
    throw new Error("XENDIT_WEBHOOK_VERIFICATION_TOKEN belum diset");
  }
  return token === expected;
}

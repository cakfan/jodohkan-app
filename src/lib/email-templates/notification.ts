const BRAND_COLOR = "#7D3E52";
const BRAND_GRADIENT = "linear-gradient(135deg, #7D3E52 0%, #632F40 100%)";

function baseHtml(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8f9fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8f9fa;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:500px;background-color:#ffffff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
          ${content}
          <tr>
            <td style="padding:24px 32px;background-color:#f9fafb;border-radius:0 0 12px 12px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} Jodohkan. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function headerHtml(title: string): string {
  return `
<tr>
  <td style="background:${BRAND_GRADIENT};padding:32px;text-align:center;border-radius:12px 12px 0 0;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">${title}</h1>
  </td>
</tr>`;
}

function bodyHtml(inner: string): string {
  return `
<tr>
  <td style="padding:40px 32px;color:#374151;font-size:15px;line-height:1.6;">
    ${inner}
  </td>
</tr>`;
}

export function getNotificationEmailHtml(
  notificationTitle: string,
  notificationBody: string,
  actionLabel: string | null,
  actionUrl: string | null
): string {
  const actionButton = actionLabel && actionUrl
    ? `
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;">
  <tr>
    <td style="border-radius:8px;background:${BRAND_GRADIENT};">
      <a href="${actionUrl}" target="_blank"
         style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
        ${actionLabel}
      </a>
    </td>
  </tr>
</table>`
    : "";

  return baseHtml(
    headerHtml("Notifikasi Jodohkan") +
    bodyHtml(`
      <p style="margin:0 0 20px;">Assalamu'alaikum,</p>
      <p style="margin:0 0 12px;font-weight:600;font-size:16px;color:${BRAND_COLOR};">${notificationTitle}</p>
      <p style="margin:0 0 12px;">${notificationBody}</p>
      ${actionButton}
      <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">
        Anda dapat melihat semua notifikasi di dashboard Jodohkan.
      </p>
    `)
  );
}

function digestItemHtml(title: string, body: string): string {
  return `
<div style="padding:12px 16px;margin-bottom:8px;background:#f9fafb;border-radius:8px;border-left:3px solid ${BRAND_COLOR};">
  <p style="margin:0 0 4px;font-weight:600;font-size:14px;color:${BRAND_COLOR};">${title}</p>
  <p style="margin:0;font-size:13px;color:#4b5563;">${body}</p>
</div>`;
}

export function getDigestEmailHtml(
  items: { title: string; body: string }[],
  unreadCount: number
): string {
  const itemsHtml = items.map((i) => digestItemHtml(i.title, i.body)).join("");

  return baseHtml(
    headerHtml("Ringkasan Aktivitas") +
    bodyHtml(`
      <p style="margin:0 0 20px;">Assalamu'alaikum,</p>
      <p style="margin:0 0 20px;font-size:15px;">
        Anda memiliki <strong style="color:${BRAND_COLOR};">${unreadCount} notifikasi</strong> yang belum dibaca di Jodohkan.
      </p>
      ${itemsHtml}
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;">
        <tr>
          <td style="border-radius:8px;background:${BRAND_GRADIENT};">
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://jodohkan.app"}/notifikasi" target="_blank"
               style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
              Lihat Notifikasi
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">
        Notifikasi ini dikirim secara otomatis. Anda dapat mengatur preferensi notifikasi di Pengaturan.
      </p>
    `)
  );
}

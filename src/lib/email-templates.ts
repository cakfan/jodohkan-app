export function getVerificationEmailHtml(name: string, userEmail: string, url: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f9fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <tr>
            <td style="background: linear-gradient(135deg, #7D3E52 0%, #632F40 100%); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Verifikasi Email</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 32px; color: #374151;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                Assalamu'alaikum <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                Terima kasih telah mendaftar di <strong>Jodohkan</strong>. Untuk mengaktifkan akun Anda dan mulai berikhtiar mencari pasangan ta'aruf, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini:
              </p>
              
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #7D3E52 0%, #632F40 100%);">
                    <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Verifikasi Email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                Link ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak meminta email ini, Anda dapat mengabaikannya.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
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

export function getPasswordResetEmailHtml(name: string, userEmail: string, url: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f9fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <tr>
            <td style="background: linear-gradient(135deg, #7D3E52 0%, #632F40 100%); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Reset Password</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 32px; color: #374151;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                Assalamu'alaikum <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                Kami menerima permintaan untuk mereset password akun Jodohkan Anda. Klik tombol di bawah ini untuk membuat password baru:
              </p>
              
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #7D3E52 0%, #632F40 100%);">
                    <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 16px; font-size: 14px; color: #6b7280; line-height: 1.6;">
                Link ini akan kedaluwarsa dalam 1 jam. Jika Anda tidak meminta reset password, Anda dapat mengabaikan email ini dengan aman.
              </p>
              <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                Jika tombol di atas tidak berfungsi, salin dan tempel link berikut ke browser Anda:<br/>
                <span style="color: #7D3E52; word-break: break-all;">${url}</span>
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
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

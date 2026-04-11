import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private mg: ReturnType<Mailgun['client']> | null = null;
  private domain: string;
  private from: string;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('MAILGUN_API_KEY');
    this.domain = this.config.get('MAILGUN_DOMAIN', 'mg.barblink.com');
    this.from = this.config.get(
      'MAILGUN_FROM',
      'Barblink <noreply@mg.barblink.com>',
    );

    if (apiKey) {
      const mailgun = new Mailgun(FormData);
      this.mg = mailgun.client({ username: 'api', key: apiKey });
      this.logger.log('Mailgun configured — OTP emails will be sent');
    } else {
      this.logger.warn(
        'MAILGUN_API_KEY not set — OTP codes will be logged to console only',
      );
    }
  }

  async sendOtp(email: string, code: string): Promise<void> {
    const subject = 'Your Barblink verification code';
    const html = this.buildOtpEmail(code);

    if (this.mg) {
      try {
        await this.mg.messages.create(this.domain, {
          from: this.from,
          to: [email],
          subject,
          html,
        });
        this.logger.log(`OTP email sent to ${email}`);
      } catch (error) {
        this.logger.error(`Failed to send OTP email to ${email}`, error);
        // Fall back to console logging
        this.logger.warn(`[FALLBACK] OTP for ${email}: ${code}`);
      }
    } else {
      // Dev fallback: log to console
      this.logger.warn(`[DEV] OTP for ${email}: ${code}`);
    }
  }

  private buildOtpEmail(code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0D0D0F;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D0D0F;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="400" cellpadding="0" cellspacing="0" style="background-color:#1A1A1F;border-radius:12px;padding:40px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <h1 style="color:#C45AFF;font-size:28px;margin:0;">Barblink</h1>
              <p style="color:#888;font-size:14px;margin:4px 0 0;">Blink, You're In.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <p style="color:#fff;font-size:16px;margin:0;">Your verification code is:</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="background-color:#0D0D0F;border:2px solid #C45AFF;border-radius:8px;padding:16px 32px;display:inline-block;">
                <span style="color:#C45AFF;font-size:32px;font-weight:bold;letter-spacing:8px;">${code}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="color:#666;font-size:13px;margin:0;">This code expires in 5 minutes.</p>
              <p style="color:#666;font-size:13px;margin:8px 0 0;">If you didn't request this, ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
  }
}

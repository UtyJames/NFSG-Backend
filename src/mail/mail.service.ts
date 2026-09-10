import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    this.resend = new Resend(config.getOrThrow('RESEND_API_KEY'));
    this.from = config.get('RESEND_FROM_EMAIL') || 'NFSG Platform <noreply@nfsg.org>';
  }

  private getBaseUrls() {
    const frontendUrl = (this.config.get('FRONTEND_URL') || 'https://nfsg.org').replace(/\/$/, '');
    const adminUrl = (this.config.get('ADMIN_URL') || frontendUrl).replace(/\/$/, '');
    const logoUrl = `${frontendUrl}/logo-transparent.png`;
    return { frontendUrl, adminUrl, logoUrl };
  }

  // ─── 1. Farmer Registration ───────────────────────────────────────────────

  async sendFarmerRegistrationSuccess(data: {
    email: string;
    fullName: string;
    memberId: string;
    verificationCode: string;
    state: string;
    lga: string;
  }) {
    const { frontendUrl, logoUrl } = this.getBaseUrls();
    const statusUrl = `${frontendUrl}/status`;

    await this.sendMail({
      to: data.email,
      subject: `✅ NFSG Registration Confirmed – ${data.memberId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registration Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 12px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #15803d, #166534); padding: 36px 24px; text-align: center; color: #ffffff;">
                      <img src="${logoUrl}" alt="NFSG Logo" width="72" height="72" style="display: block; margin: 0 auto 12px auto; max-width: 72px; height: auto;" />
                      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Nigerian Farmers Support Group</h1>
                      <p style="margin: 6px 0 0; font-size: 14px; color: #bbf7d0; font-weight: 500;">Official Farmer Registration Confirmation</p>
                    </td>
                  </tr>

                  <!-- Content Body -->
                  <tr>
                    <td style="padding: 32px 28px;">
                      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Dear <strong>${data.fullName}</strong>,</p>
                      <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                        Your farmer registration for the <strong>Nigerian Farmers Support Group (NFSG)</strong> has been successfully received and is queued for verification.
                      </p>

                      <!-- Registration Summary Card -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin: 24px 0; padding: 18px 20px;">
                        <tr>
                          <td colspan="2" style="padding-bottom: 12px; font-size: 15px; font-weight: 700; color: #15803d; border-bottom: 1px dashed #86efac;">
                            🌾 Registration Details
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0 6px; font-size: 13px; color: #6b7280; width: 40%;">Member ID:</td>
                          <td style="padding: 10px 0 6px; font-size: 14px; font-weight: 700; font-family: monospace; color: #111827;">${data.memberId}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Full Name:</td>
                          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #111827;">${data.fullName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">State / LGA:</td>
                          <td style="padding: 6px 0; font-size: 14px; color: #111827;">${data.state} / ${data.lga}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0 2px; font-size: 13px; color: #6b7280;">Status:</td>
                          <td style="padding: 6px 0 2px;">
                            <span style="background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; display: inline-block;">PENDING VERIFICATION</span>
                          </td>
                        </tr>
                      </table>

                      <!-- Verification Code Callout -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; margin: 24px 0; padding: 20px; text-align: center;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px;">Your Status Verification Code</p>
                            <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 800; letter-spacing: 4px; color: #1d4ed8;">${data.verificationCode}</p>
                            <p style="margin: 10px 0 0; font-size: 13px; color: #3b82f6;">
                              Check your allocation status anytime at <a href="${statusUrl}" style="color: #1d4ed8; font-weight: 600; text-decoration: underline;">${statusUrl}</a>
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Next Steps -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; margin: 24px 0; padding: 18px 20px;">
                        <tr>
                          <td style="font-size: 14px; font-weight: 700; color: #92400e; padding-bottom: 8px;">
                            📋 Important Next Steps:
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size: 13px; line-height: 1.6; color: #78350f;">
                            1. Save this email or write down your <strong>Member ID</strong> and <strong>Verification Code</strong>.<br/>
                            2. Your LGA Coordinator will contact you once distribution commences.<br/>
                            3. Keep your valid ID (NIN or Voter's Card) ready for verification at the collection center.
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 13px; line-height: 1.6; color: #6b7280; margin-bottom: 0;">
                        Need help? Contact NFSG Support at <a href="mailto:support@nfsg.org" style="color: #15803d; text-decoration: underline;">support@nfsg.org</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 24px; text-align: center; font-size: 12px; color: #9ca3af;">
                      <p style="margin: 0 0 4px;">© ${new Date().getFullYear()} Nigerian Farmers Support Group (NFSG). All rights reserved.</p>
                      <p style="margin: 0;">Empowering sustainable agriculture across Nigeria.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  }

  // ─── 2. Supplier Registration ─────────────────────────────────────────────

  async sendSupplierRegistrationSuccess(data: {
    email: string;
    repName: string;
    supplierId: string;
    verificationCode: string;
    companyName: string;
  }) {
    const { frontendUrl, logoUrl } = this.getBaseUrls();

    await this.sendMail({
      to: data.email,
      subject: `✅ NFSG Supplier Registration Received – ${data.supplierId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Supplier Registration</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 12px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #15803d, #166534); padding: 36px 24px; text-align: center; color: #ffffff;">
                      <img src="${logoUrl}" alt="NFSG Logo" width="72" height="72" style="display: block; margin: 0 auto 12px auto; max-width: 72px; height: auto;" />
                      <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Nigerian Farmers Support Group</h1>
                      <p style="margin: 6px 0 0; font-size: 14px; color: #bbf7d0;">Supplier Application Confirmation</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 32px 28px;">
                      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Dear <strong>${data.repName}</strong>,</p>
                      <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                        Your supplier onboarding application on behalf of <strong>${data.companyName}</strong> has been received and is currently under compliance review.
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin: 24px 0; padding: 18px 20px;">
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280; width: 40%;">Supplier ID:</td>
                          <td style="padding: 6px 0; font-size: 14px; font-weight: 700; font-family: monospace;">${data.supplierId}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Company Name:</td>
                          <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${data.companyName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Representative:</td>
                          <td style="padding: 6px 0; font-size: 14px;">${data.repName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Status:</td>
                          <td style="padding: 6px 0;">
                            <span style="background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 9999px;">UNDER REVIEW</span>
                          </td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; margin: 24px 0; padding: 20px; text-align: center;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #1e40af;">YOUR VERIFICATION CODE</p>
                            <p style="margin: 0; font-family: monospace; font-size: 26px; font-weight: 800; letter-spacing: 4px; color: #1d4ed8;">${data.verificationCode}</p>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
                        Our compliance team will review your FISS certificate and regulatory documentation. You will receive an email update once verification is complete.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 24px; text-align: center; font-size: 12px; color: #9ca3af;">
                      © ${new Date().getFullYear()} Nigerian Farmers Support Group (NFSG). All rights reserved.
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  }

  // ─── 3. Distributor Registration ───────────────────────────────────────────

  async sendDistributorRegistrationSuccess(data: {
    email: string;
    name: string;
    distributorId: string;
    verificationCode: string;
    companyName: string;
    state: string;
    lgaCovered: string;
  }) {
    const { logoUrl } = this.getBaseUrls();

    await this.sendMail({
      to: data.email,
      subject: `✅ NFSG Distributor Application Received – ${data.distributorId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Distributor Registration</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 12px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #15803d, #166534); padding: 36px 24px; text-align: center; color: #ffffff;">
                      <img src="${logoUrl}" alt="NFSG Logo" width="72" height="72" style="display: block; margin: 0 auto 12px auto; max-width: 72px; height: auto;" />
                      <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Nigerian Farmers Support Group</h1>
                      <p style="margin: 6px 0 0; font-size: 14px; color: #bbf7d0;">Distributor Application Confirmation</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 32px 28px;">
                      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Dear <strong>${data.name}</strong>,</p>
                      <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                        Your registration for <strong>${data.companyName}</strong> as an authorized input distributor has been received.
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin: 24px 0; padding: 18px 20px;">
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280; width: 40%;">Distributor ID:</td>
                          <td style="padding: 6px 0; font-size: 14px; font-weight: 700; font-family: monospace;">${data.distributorId}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Company Name:</td>
                          <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${data.companyName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Coverage Area:</td>
                          <td style="padding: 6px 0; font-size: 14px;">${data.state} (${data.lgaCovered})</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Status:</td>
                          <td style="padding: 6px 0;">
                            <span style="background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 9999px;">UNDER REVIEW</span>
                          </td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; margin: 24px 0; padding: 20px; text-align: center;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #1e40af;">YOUR VERIFICATION CODE</p>
                            <p style="margin: 0; font-family: monospace; font-size: 26px; font-weight: 800; letter-spacing: 4px; color: #1d4ed8;">${data.verificationCode}</p>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
                        Our logistics & compliance team will verify your NAIDA certificate and reach out with network partnership details.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 24px; text-align: center; font-size: 12px; color: #9ca3af;">
                      © ${new Date().getFullYear()} Nigerian Farmers Support Group (NFSG). All rights reserved.
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  }

  // ─── 4. LGA Coordinator Registration ──────────────────────────────────────

  async sendLgaCoordinatorRegistrationSuccess(data: {
    email: string;
    fullName: string;
    coordinatorId: string;
    verificationCode: string;
    state: string;
    lgaJurisdiction: string;
  }) {
    const { logoUrl } = this.getBaseUrls();

    await this.sendMail({
      to: data.email,
      subject: `✅ NFSG LGA Coordinator Profile Submitted – ${data.coordinatorId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>LGA Coordinator Registration</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 12px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #15803d, #166534); padding: 36px 24px; text-align: center; color: #ffffff;">
                      <img src="${logoUrl}" alt="NFSG Logo" width="72" height="72" style="display: block; margin: 0 auto 12px auto; max-width: 72px; height: auto;" />
                      <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Nigerian Farmers Support Group</h1>
                      <p style="margin: 6px 0 0; font-size: 14px; color: #bbf7d0;">LGA Coordinator Profile Submitted</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 32px 28px;">
                      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Dear <strong>${data.fullName}</strong>,</p>
                      <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                        Your profile submission as LGA Coordinator has been received and forwarded to State Operations for appointment review.
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin: 24px 0; padding: 18px 20px;">
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280; width: 40%;">Coordinator ID:</td>
                          <td style="padding: 6px 0; font-size: 14px; font-weight: 700; font-family: monospace;">${data.coordinatorId}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Full Name:</td>
                          <td style="padding: 6px 0; font-size: 14px; font-weight: 600;">${data.fullName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Jurisdiction:</td>
                          <td style="padding: 6px 0; font-size: 14px;">${data.state} (${data.lgaJurisdiction})</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Status:</td>
                          <td style="padding: 6px 0;">
                            <span style="background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 9999px;">PENDING APPROVAL</span>
                          </td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; margin: 24px 0; padding: 20px; text-align: center;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #1e40af;">YOUR VERIFICATION CODE</p>
                            <p style="margin: 0; font-family: monospace; font-size: 26px; font-weight: 800; letter-spacing: 4px; color: #1d4ed8;">${data.verificationCode}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 24px; text-align: center; font-size: 12px; color: #9ca3af;">
                      © ${new Date().getFullYear()} Nigerian Farmers Support Group (NFSG). All rights reserved.
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  }

  // ─── 5. Admin Welcome Email ───────────────────────────────────────────────

  async sendAdminWelcome(data: {
    email: string;
    fullName: string;
    username: string;
    password: string;
    role: string;
  }) {
    const { adminUrl, logoUrl } = this.getBaseUrls();

    await this.sendMail({
      to: data.email,
      subject: '🔐 NFSG Admin Access – Your Account Credentials',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin Account Created</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 12px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e3a8a, #1e40af); padding: 36px 24px; text-align: center; color: #ffffff;">
                      <img src="${logoUrl}" alt="NFSG Logo" width="72" height="72" style="display: block; margin: 0 auto 12px auto; max-width: 72px; height: auto;" />
                      <h1 style="margin: 0; font-size: 22px; font-weight: 800;">NFSG Admin Portal</h1>
                      <p style="margin: 6px 0 0; font-size: 14px; color: #bfdbfe;">Administrative Account Created</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 32px 28px;">
                      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hello <strong>${data.fullName}</strong>,</p>
                      <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                        An administrator account has been created for you with the role of <strong style="color: #1e40af;">${data.role.replace('_', ' ')}</strong> on the NFSG Management Portal.
                      </p>

                      <!-- Credentials Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; margin: 24px 0; padding: 20px;">
                        <tr>
                          <td colspan="2" style="padding-bottom: 12px; font-size: 14px; font-weight: 700; color: #1e40af; border-bottom: 1px dashed #93c5fd;">
                            🔑 Login Credentials
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0 6px; font-size: 13px; color: #6b7280; width: 35%;">Email:</td>
                          <td style="padding: 10px 0 6px; font-size: 14px; font-weight: 600; font-family: monospace; color: #111827;">${data.email}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Username:</td>
                          <td style="padding: 6px 0; font-size: 14px; font-weight: 600; font-family: monospace; color: #111827;">${data.username}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Temporary Password:</td>
                          <td style="padding: 6px 0; font-size: 15px; font-weight: 700; font-family: monospace; color: #dc2626;">${data.password}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0 2px; font-size: 13px; color: #6b7280;">Assigned Role:</td>
                          <td style="padding: 6px 0 2px;">
                            <span style="background-color: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">${data.role}</span>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 28px 0;">
                        <a href="${adminUrl}/admin/login" style="background: linear-gradient(135deg, #1d4ed8, #2563eb); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(29, 78, 216, 0.25);">
                          Log In to Admin Portal →
                        </a>
                      </div>

                      <!-- Security Warning -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin: 20px 0; padding: 14px;">
                        <tr>
                          <td style="font-size: 13px; line-height: 1.5; color: #991b1b;">
                            ⚠️ <strong>Security Notice:</strong> Please change your temporary password immediately upon your first login. Do not share your credentials with anyone.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 24px; text-align: center; font-size: 12px; color: #9ca3af;">
                      © ${new Date().getFullYear()} Nigerian Farmers Support Group (NFSG). All rights reserved.
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  }

  // ─── 6. Status Update (Approved / Declined) ────────────────────────────────

  async sendStatusUpdate(data: {
    email: string;
    name: string;
    registrationId: string;
    registrationType: string;
    status: 'APPROVED' | 'DECLINED';
    note?: string;
  }) {
    const isApproved = data.status === 'APPROVED';
    const { logoUrl } = this.getBaseUrls();

    await this.sendMail({
      to: data.email,
      subject: `${isApproved ? '✅ Application Approved' : '❌ Application Update'} – ${data.registrationId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Status Update</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 12px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: ${isApproved ? 'linear-gradient(135deg, #15803d, #166534)' : 'linear-gradient(135deg, #b91c1c, #991b1b)'}; padding: 36px 24px; text-align: center; color: #ffffff;">
                      <img src="${logoUrl}" alt="NFSG Logo" width="72" height="72" style="display: block; margin: 0 auto 12px auto; max-width: 72px; height: auto;" />
                      <h1 style="margin: 0; font-size: 22px; font-weight: 800;">
                        ${isApproved ? '✅ Application Approved' : '❌ Application Declined'}
                      </h1>
                      <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Nigerian Farmers Support Group</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 32px 28px;">
                      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Dear <strong>${data.name}</strong>,</p>
                      <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                        Your <strong>${data.registrationType}</strong> registration (<span style="font-family: monospace; font-weight: 700;">${data.registrationId}</span>) has been 
                        <strong style="color: ${isApproved ? '#15803d' : '#dc2626'};">${isApproved ? 'APPROVED' : 'DECLINED'}</strong> by the NFSG compliance team.
                      </p>

                      ${data.note ? `
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-left: 4px solid ${isApproved ? '#15803d' : '#dc2626'}; border-radius: 8px; margin: 20px 0; padding: 16px 20px;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #374151;">Note from Compliance Team:</p>
                            <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.5;">${data.note}</p>
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                      ${isApproved ? `
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin: 24px 0; padding: 18px 20px;">
                        <tr>
                          <td style="font-size: 14px; font-weight: 700; color: #15803d; padding-bottom: 6px;">
                            🎉 Welcome to the NFSG Network!
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size: 13px; line-height: 1.6; color: #166534;">
                            Your profile is now verified. You will be contacted with operational schedules and next steps.
                          </td>
                        </tr>
                      </table>
                      ` : `
                      <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
                        If you believe this decision was made in error or wish to submit updated documentation, please contact our support team at <a href="mailto:support@nfsg.org" style="color: #dc2626; text-decoration: underline;">support@nfsg.org</a>.
                      </p>
                      `}
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 24px; text-align: center; font-size: 12px; color: #9ca3af;">
                      © ${new Date().getFullYear()} Nigerian Farmers Support Group (NFSG). All rights reserved.
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  }

  // ─── Internal Helper ──────────────────────────────────────────────────────

  private async sendMail(opts: { to: string; subject: string; html: string }) {
    try {
      const { error } = await this.resend.emails.send({
        from: this.from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      });
      if (error) {
        this.logger.warn(`Email send failed to ${opts.to}: ${JSON.stringify(error)}`);
      }
    } catch (err) {
      this.logger.error(`Mail service error: ${(err as Error).message}`);
    }
  }
}

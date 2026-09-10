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
    const frontendUrl = (this.config.get('FRONTEND_URL') || 'https://nfsg-frontend.vercel.app').replace(/\/$/, '');
    const adminUrl = (this.config.get('ADMIN_URL') || frontendUrl).replace(/\/$/, '');
    const logoUrl = `${frontendUrl}/logo-transparent.png`;
    return { frontendUrl, adminUrl, logoUrl };
  }

  private getEmailFooterHtml(): string {
    const year = new Date().getFullYear();
    return `
      <!-- Contact & Footer Section -->
      <tr>
        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 28px; text-align: center; font-size: 13px; color: #64748b;">
          <p style="margin: 0 0 10px 0; font-weight: 700; color: #1e293b; font-size: 14px;">Nigerian Farmers Support Group (NFSG)</p>
          <p style="margin: 0 0 6px 0; line-height: 1.4;">📍 Amb I Osakwe House, Innerblock Street, CBD, Abuja</p>
          <p style="margin: 0 0 12px 0; line-height: 1.4;">
            📞 Official Line: <a href="tel:+2348112225723" style="color: #16a34a; font-weight: 600; text-decoration: none;">08112225723</a> &nbsp;|&nbsp; 
            ✉️ <a href="mailto:Nfsgadmin@gmail.com" style="color: #16a34a; font-weight: 600; text-decoration: none;">Nfsgadmin@gmail.com</a>
          </p>
          <div style="margin: 14px 0 10px 0;">
            <a href="https://www.instagram.com/farmerssupportgroup/" target="_blank" style="display: inline-block; margin: 0 8px; color: #16a34a; font-weight: 600; text-decoration: none; font-size: 12px;">Instagram</a>
            <span style="color: #cbd5e1;">•</span>
            <a href="https://www.tiktok.com/@farmerssupportgro" target="_blank" style="display: inline-block; margin: 0 8px; color: #16a34a; font-weight: 600; text-decoration: none; font-size: 12px;">TikTok</a>
          </div>
          <p style="margin: 12px 0 0 0; font-size: 11px; color: #94a3b8;">
            © ${year} Nigerian Farmers Support Group. All rights reserved.
          </p>
        </td>
      </tr>
    `;
  }

  // ─── 1. Farmer Registration ───────────────────────────────────────────────

  async sendFarmerRegistrationSuccess(data: {
    email: string;
    fullName?: string;
    name?: string;
    memberId?: string;
    registrationId?: string;
    verificationCode?: string;
    state?: string;
    lga?: string;
    [key: string]: any;
  }) {
    const { frontendUrl, logoUrl } = this.getBaseUrls();
    const statusUrl = `${frontendUrl}/status`;
    const fullName = data.fullName || data.name || 'Valued Farmer';
    const memberId = data.memberId || data.registrationId || 'NFSG-MEMBER';
    const verificationCode = data.verificationCode || 'NFSG';
    const location = [data.lga, data.state ? `${data.state} State` : ''].filter(Boolean).join(', ') || 'Nigeria';

    await this.sendMail({
      to: data.email,
      subject: `✅ NFSG Registration Confirmed – ${memberId}`,
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
                      <img src="${logoUrl}" alt="NFSG Logo" width="80" height="80" style="display: block; margin: 0 auto 12px auto; max-width: 80px; height: auto;" />
                      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Nigerian Farmers Support Group</h1>
                      <p style="margin: 6px 0 0; font-size: 14px; color: #bbf7d0; font-weight: 500;">Official Farmer Registration Confirmation</p>
                    </td>
                  </tr>

                  <!-- Content Body -->
                  <tr>
                    <td style="padding: 32px 28px;">
                      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Dear <strong>${fullName}</strong>,</p>
                      <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                        Welcome to the Nigerian Farmers Support Group. Your registration as a farmer has been successfully received and recorded in our national database.
                      </p>

                      <!-- Credentials Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; margin: 24px 0; padding: 20px;">
                        <tr>
                          <td style="padding-bottom: 12px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #166534; letter-spacing: 0.5px;">NFSG Member ID</span>
                            <div style="font-size: 22px; font-weight: 800; font-family: monospace; color: #15803d; margin-top: 2px;">${memberId}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-top: 1px dashed #bbf7d0; padding-top: 12px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #166534; letter-spacing: 0.5px;">Verification Code</span>
                            <div style="font-size: 18px; font-weight: 700; font-family: monospace; color: #166534; margin-top: 2px;">${verificationCode}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-top: 1px dashed #bbf7d0; padding-top: 12px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #166534; letter-spacing: 0.5px;">Registered Location</span>
                            <div style="font-size: 14px; font-weight: 600; color: #374151; margin-top: 2px;">${location}</div>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
                        Please keep your <strong>Member ID</strong> and <strong>Verification Code</strong> safe. You will need them to check your application status, track agricultural input disbursements, and access NFSG support programmes.
                      </p>

                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 28px 0;">
                        <a href="${statusUrl}" style="background: linear-gradient(135deg, #15803d, #16a34a); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(21, 128, 61, 0.3);">
                          Check Application Status →
                        </a>
                      </div>
                    </td>
                  </tr>

                  ${this.getEmailFooterHtml()}

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
    contactPerson?: string;
    repName?: string;
    name?: string;
    companyName: string;
    registrationId?: string;
    supplierId?: string;
    verificationCode?: string;
    category?: string;
    inputAvailable?: any;
    state?: string;
    [key: string]: any;
  }) {
    const { frontendUrl, logoUrl } = this.getBaseUrls();
    const statusUrl = `${frontendUrl}/status`;
    const contact = data.contactPerson || data.repName || data.name || 'Partner';
    const regId = data.registrationId || data.supplierId || 'NFSG-SUPPLIER';
    const cat = data.category || (Array.isArray(data.inputAvailable) ? data.inputAvailable.join(', ') : data.inputAvailable) || 'Agricultural Inputs';
    const location = data.state ? `${data.state} State` : 'Nigeria';

    await this.sendMail({
      to: data.email,
      subject: `🏢 NFSG Supplier Application Received – ${regId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Supplier Application Received</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 12px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0f766e, #115e59); padding: 36px 24px; text-align: center; color: #ffffff;">
                      <img src="${logoUrl}" alt="NFSG Logo" width="80" height="80" style="display: block; margin: 0 auto 12px auto; max-width: 80px; height: auto;" />
                      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Nigerian Farmers Support Group</h1>
                      <p style="margin: 6px 0 0; font-size: 14px; color: #99f6e4; font-weight: 500;">Supplier & Vendor Registration Confirmation</p>
                    </td>
                  </tr>

                  <!-- Content Body -->
                  <tr>
                    <td style="padding: 32px 28px;">
                      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Dear <strong>${contact}</strong>,</p>
                      <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                        Thank you for applying to partner with NFSG. The supplier application for <strong>${data.companyName}</strong> has been received and queued for review.
                      </p>

                      <!-- Details Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdfa; border: 1.5px solid #5eead4; border-radius: 12px; margin: 24px 0; padding: 20px;">
                        <tr>
                          <td style="padding-bottom: 12px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #115e59; letter-spacing: 0.5px;">Registration Reference ID</span>
                            <div style="font-size: 22px; font-weight: 800; font-family: monospace; color: #0f766e; margin-top: 2px;">${regId}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-top: 1px dashed #99f6e4; padding-top: 12px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #115e59; letter-spacing: 0.5px;">Supply Category</span>
                            <div style="font-size: 14px; font-weight: 600; color: #1f2937; margin-top: 2px;">${cat}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-top: 1px dashed #99f6e4; padding-top: 12px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #115e59; letter-spacing: 0.5px;">Operating Location</span>
                            <div style="font-size: 14px; font-weight: 600; color: #1f2937; margin-top: 2px;">${location}</div>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
                        Our procurement and verification team will review your submitted CAC and business documentation. You will receive an email once the review is completed.
                      </p>

                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 28px 0;">
                        <a href="${statusUrl}" style="background: linear-gradient(135deg, #0f766e, #0d9488); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.3);">
                          Track Application Status →
                        </a>
                      </div>
                    </td>
                  </tr>

                  ${this.getEmailFooterHtml()}

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  }

  // ─── 3. Distributor Registration ──────────────────────────────────────────

  async sendDistributorRegistrationSuccess(data: {
    email: string;
    contactPerson?: string;
    name?: string;
    hubName?: string;
    companyName?: string;
    registrationId?: string;
    distributorId?: string;
    verificationCode?: string;
    distributionCapacity?: string;
    state?: string;
    lgaCovered?: string;
    [key: string]: any;
  }) {
    const { frontendUrl, logoUrl } = this.getBaseUrls();
    const statusUrl = `${frontendUrl}/status`;
    const contact = data.contactPerson || data.name || 'Partner';
    const hub = data.hubName || data.companyName || 'Distribution Hub';
    const regId = data.registrationId || data.distributorId || 'NFSG-DIST';
    const capacity = data.distributionCapacity || 'Regional Distribution';
    const location = [data.lgaCovered, data.state ? `${data.state} State` : ''].filter(Boolean).join(', ') || 'Nigeria';

    await this.sendMail({
      to: data.email,
      subject: `🚚 NFSG Distributor Application Received – ${regId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Distributor Application Received</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 12px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e40af, #1d4ed8); padding: 36px 24px; text-align: center; color: #ffffff;">
                      <img src="${logoUrl}" alt="NFSG Logo" width="80" height="80" style="display: block; margin: 0 auto 12px auto; max-width: 80px; height: auto;" />
                      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Nigerian Farmers Support Group</h1>
                      <p style="margin: 6px 0 0; font-size: 14px; color: #bfdbfe; font-weight: 500;">Distribution Hub Application Confirmation</p>
                    </td>
                  </tr>

                  <!-- Content Body -->
                  <tr>
                    <td style="padding: 32px 28px;">
                      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Dear <strong>${contact}</strong>,</p>
                      <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                        Thank you for applying to be an authorized NFSG distribution partner for <strong>${hub}</strong>.
                      </p>

                      <!-- Details Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 12px; margin: 24px 0; padding: 20px;">
                        <tr>
                          <td style="padding-bottom: 12px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #1e40af; letter-spacing: 0.5px;">Registration Reference ID</span>
                            <div style="font-size: 22px; font-weight: 800; font-family: monospace; color: #1d4ed8; margin-top: 2px;">${regId}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-top: 1px dashed #bfdbfe; padding-top: 12px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #1e40af; letter-spacing: 0.5px;">Distribution Capacity</span>
                            <div style="font-size: 14px; font-weight: 600; color: #1f2937; margin-top: 2px;">${capacity}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-top: 1px dashed #bfdbfe; padding-top: 12px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #1e40af; letter-spacing: 0.5px;">Coverage Location</span>
                            <div style="font-size: 14px; font-weight: 600; color: #1f2937; margin-top: 2px;">${location}</div>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
                        Our logistics and network team will evaluate your warehouse capacity and logistics infrastructure. We will notify you once verified.
                      </p>

                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 28px 0;">
                        <a href="${statusUrl}" style="background: linear-gradient(135deg, #1e40af, #2563eb); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);">
                          Track Application Status →
                        </a>
                      </div>
                    </td>
                  </tr>

                  ${this.getEmailFooterHtml()}

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  }

  // ─── 4. LGA Coordinator Registration ─────────────────────────────────────

  async sendLgaCoordinatorRegistrationSuccess(data: {
    email: string;
    fullName?: string;
    name?: string;
    registrationId?: string;
    coordinatorId?: string;
    verificationCode?: string;
    state?: string;
    lga?: string;
    lgaJurisdiction?: string;
    [key: string]: any;
  }) {
    const { frontendUrl, logoUrl } = this.getBaseUrls();
    const statusUrl = `${frontendUrl}/status`;
    const fullName = data.fullName || data.name || 'Coordinator';
    const regId = data.registrationId || data.coordinatorId || 'NFSG-LGA';
    const lga = data.lga || data.lgaJurisdiction || '';
    const location = [lga ? `${lga} LGA` : '', data.state ? `${data.state} State` : ''].filter(Boolean).join(', ') || 'Nigeria';

    await this.sendMail({
      to: data.email,
      subject: `🌾 NFSG LGA Coordinator Application Received – ${regId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>LGA Coordinator Application Received</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 12px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #ca8a04, #a16207); padding: 36px 24px; text-align: center; color: #ffffff;">
                      <img src="${logoUrl}" alt="NFSG Logo" width="80" height="80" style="display: block; margin: 0 auto 12px auto; max-width: 80px; height: auto;" />
                      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Nigerian Farmers Support Group</h1>
                      <p style="margin: 6px 0 0; font-size: 14px; color: #fef08a; font-weight: 500;">LGA Coordinator Application Confirmation</p>
                    </td>
                  </tr>

                  <!-- Content Body -->
                  <tr>
                    <td style="padding: 32px 28px;">
                      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Dear <strong>${fullName}</strong>,</p>
                      <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                        Thank you for your willingness to lead and serve as an NFSG LGA Coordinator for <strong>${location}</strong>.
                      </p>

                      <!-- Details Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fefce8; border: 1.5px solid #fde047; border-radius: 12px; margin: 24px 0; padding: 20px;">
                        <tr>
                          <td style="padding-bottom: 12px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #854d0e; letter-spacing: 0.5px;">Application Reference ID</span>
                            <div style="font-size: 22px; font-weight: 800; font-family: monospace; color: #a16207; margin-top: 2px;">${regId}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="border-top: 1px dashed #fef08a; padding-top: 12px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #854d0e; letter-spacing: 0.5px;">Assigned Area</span>
                            <div style="font-size: 14px; font-weight: 600; color: #1f2937; margin-top: 2px;">${location}</div>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 14px; line-line: 1.6; color: #4b5563;">
                        The NFSG Executive Council is reviewing all LGA leadership nominations. Successful coordinators will undergo orientation and receive field oversight kits.
                      </p>

                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 28px 0;">
                        <a href="${statusUrl}" style="background: linear-gradient(135deg, #ca8a04, #d97706); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(202, 138, 4, 0.3);">
                          Check Nomination Status →
                        </a>
                      </div>
                    </td>
                  </tr>

                  ${this.getEmailFooterHtml()}

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  }

  // ─── 5. Admin User Invitation / Welcome ────────────────────────────────────

  async sendAdminWelcome(data: {
    email: string;
    fullName?: string;
    username?: string;
    name?: string;
    temporaryPassword?: string;
    password?: string;
    role: string;
    [key: string]: any;
  }) {
    const { adminUrl, logoUrl } = this.getBaseUrls();
    const fullName = data.fullName || data.username || data.name || 'Admin';
    const tempPassword = data.temporaryPassword || data.password;

    await this.sendMail({
      to: data.email,
      subject: `🛡️ You have been added to the NFSG Admin Portal`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin Portal Access</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 12px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 36px 24px; text-align: center; color: #ffffff;">
                      <img src="${logoUrl}" alt="NFSG Logo" width="80" height="80" style="display: block; margin: 0 auto 12px auto; max-width: 80px; height: auto;" />
                      <h1 style="margin: 0; font-size: 22px; font-weight: 800;">NFSG Management Portal</h1>
                      <p style="margin: 6px 0 0; font-size: 14px; color: #94a3b8;">Staff & Executive Access</p>
                    </td>
                  </tr>

                  <!-- Content Body -->
                  <tr>
                    <td style="padding: 32px 28px;">
                      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Dear <strong>${fullName}</strong>,</p>
                      <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
                        An administrative account has been provisioned for you on the NFSG Management Console.
                      </p>

                      <!-- Credentials -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 24px 0; padding: 20px;">
                        <tr>
                          <td style="padding-bottom: 12px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Login Email</span>
                            <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">${data.email}</div>
                          </td>
                        </tr>
                        ${tempPassword ? `
                        <tr>
                          <td style="border-top: 1px dashed #e2e8f0; padding-top: 12px; padding-bottom: 12px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Temporary Password</span>
                            <div style="font-size: 18px; font-weight: 800; font-family: monospace; color: #0f172a; margin-top: 2px;">${tempPassword}</div>
                          </td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="border-top: 1px dashed #e2e8f0; padding-top: 12px;">
                            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Assigned Role</span>
                            <div style="margin-top: 4px;">
                              <span style="background-color: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">${data.role}</span>
                            </div>
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

                  ${this.getEmailFooterHtml()}

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
    [key: string]: any;
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
                      <img src="${logoUrl}" alt="NFSG Logo" width="80" height="80" style="display: block; margin: 0 auto 12px auto; max-width: 80px; height: auto;" />
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
                        If you believe this decision was made in error or wish to submit updated documentation, please contact our support team at <a href="mailto:Nfsgadmin@gmail.com" style="color: #dc2626; text-decoration: underline;">Nfsgadmin@gmail.com</a>.
                      </p>
                      `}
                    </td>
                  </tr>

                  ${this.getEmailFooterHtml()}

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

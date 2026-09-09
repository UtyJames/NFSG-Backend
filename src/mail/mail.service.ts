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

  // ─── Registration Success ───────────────────────────────────────────────────

  async sendFarmerRegistrationSuccess(data: {
    email: string;
    fullName: string;
    memberId: string;
    verificationCode: string;
    state: string;
    lga: string;
  }) {
    const appUrl = this.config.get('FRONTEND_URL') || 'https://nfsg.org';
    const statusUrl = `${appUrl}/status`;

    await this.sendMail({
      to: data.email,
      subject: '✅ NFSG Registration Successful – ' + data.memberId,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
          <div style="background: #15803d; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin:0;font-size:22px;">🌾 Nigerian Farmers Support Group</h1>
            <p style="margin:4px 0 0;font-size:14px;opacity:0.9;">Official Registration Confirmation</p>
          </div>
          <div style="background: white; padding: 28px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <p style="font-size:16px;">Dear <strong>${data.fullName}</strong>,</p>
            <p>Your farmer registration with the Nigerian Farmers Support Group has been <strong>successfully received</strong>.</p>
            
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 8px;font-weight:bold;color:#15803d;">Your Registration Details</p>
              <table style="width:100%;font-size:14px;">
                <tr><td style="color:#6b7280;padding:4px 0;">Member ID:</td><td style="font-weight:bold;font-family:monospace;">${data.memberId}</td></tr>
                <tr><td style="color:#6b7280;padding:4px 0;">Name:</td><td>${data.fullName}</td></tr>
                <tr><td style="color:#6b7280;padding:4px 0;">Location:</td><td>${data.state} | ${data.lga}</td></tr>
                <tr><td style="color:#6b7280;padding:4px 0;">Status:</td><td><span style="background:#fef9c3;color:#854d0e;padding:2px 8px;border-radius:4px;font-size:12px;">PENDING REVIEW</span></td></tr>
              </table>
            </div>

            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 8px;font-weight:bold;color:#1d4ed8;">🔑 Your Verification Code</p>
              <p style="font-family:monospace;font-size:22px;letter-spacing:4px;color:#1e40af;margin:0;">${data.verificationCode}</p>
              <p style="font-size:12px;color:#3b82f6;margin:8px 0 0;">Use this code at <a href="${statusUrl}">${statusUrl}</a> to check your verification status.</p>
            </div>

            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 8px;font-weight:bold;color:#c2410c;">📋 What to do next:</p>
              <ol style="margin:0;padding-left:20px;font-size:14px;color:#6b7280;">
                <li>Screenshot or save this email for your records.</li>
                <li>Keep your Member ID and Verification Code safe.</li>
                <li>Your State Coordinator will contact you with the event date and venue.</li>
                <li>Bring your physical Voter's Card or NIN for identification.</li>
              </ol>
            </div>

            <p style="font-size:13px;color:#6b7280;margin-top:24px;">
              For support, contact us at <a href="mailto:support@nfsg.org">support@nfsg.org</a>
            </p>
          </div>
        </div>
      `,
    });
  }

  async sendSupplierRegistrationSuccess(data: {
    email: string;
    repName: string;
    supplierId: string;
    verificationCode: string;
    companyName: string;
  }) {
    await this.sendMail({
      to: data.email,
      subject: `✅ NFSG Supplier Registration Received – ${data.supplierId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
          <div style="background: #15803d; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin:0;font-size:22px;">🌾 Nigerian Farmers Support Group</h1>
            <p style="margin:4px 0 0;font-size:14px;opacity:0.9;">Supplier Registration Confirmation</p>
          </div>
          <div style="background: white; padding: 28px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <p>Dear <strong>${data.repName}</strong>,</p>
            <p>Your supplier registration for <strong>${data.companyName}</strong> has been received and is under review.</p>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
              <table style="width:100%;font-size:14px;">
                <tr><td style="color:#6b7280;">Supplier ID:</td><td style="font-weight:bold;font-family:monospace;">${data.supplierId}</td></tr>
                <tr><td style="color:#6b7280;">Company:</td><td>${data.companyName}</td></tr>
                <tr><td style="color:#6b7280;">Status:</td><td>PENDING REVIEW</td></tr>
              </table>
            </div>
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 8px;font-weight:bold;color:#1d4ed8;">🔑 Verification Code</p>
              <p style="font-family:monospace;font-size:22px;letter-spacing:4px;color:#1e40af;margin:0;">${data.verificationCode}</p>
            </div>
            <p>Our compliance team will verify your FISS certificate and contact you shortly.</p>
          </div>
        </div>
      `,
    });
  }

  async sendDistributorRegistrationSuccess(data: {
    email: string;
    name: string;
    distributorId: string;
    verificationCode: string;
    companyName: string;
    state: string;
    lgaCovered: string;
  }) {
    await this.sendMail({
      to: data.email,
      subject: `✅ NFSG Distributor Registration Received – ${data.distributorId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
          <div style="background: #15803d; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin:0;font-size:22px;">🌾 Nigerian Farmers Support Group</h1>
            <p style="margin:4px 0 0;font-size:14px;opacity:0.9;">Distributor Registration Confirmation</p>
          </div>
          <div style="background: white; padding: 28px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <p>Dear <strong>${data.name}</strong>,</p>
            <p>Your distributor registration for <strong>${data.companyName}</strong> has been received.</p>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
              <table style="width:100%;font-size:14px;">
                <tr><td style="color:#6b7280;">Distributor ID:</td><td style="font-weight:bold;font-family:monospace;">${data.distributorId}</td></tr>
                <tr><td style="color:#6b7280;">Company:</td><td>${data.companyName}</td></tr>
                <tr><td style="color:#6b7280;">Coverage:</td><td>${data.state} | ${data.lgaCovered}</td></tr>
                <tr><td style="color:#6b7280;">Status:</td><td>PENDING REVIEW</td></tr>
              </table>
            </div>
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 8px;font-weight:bold;color:#1d4ed8;">🔑 Verification Code</p>
              <p style="font-family:monospace;font-size:22px;letter-spacing:4px;color:#1e40af;margin:0;">${data.verificationCode}</p>
            </div>
            <p>Our compliance team will verify your NAIDA certificate and get in touch.</p>
          </div>
        </div>
      `,
    });
  }

  async sendLgaCoordinatorRegistrationSuccess(data: {
    email: string;
    fullName: string;
    coordinatorId: string;
    verificationCode: string;
    state: string;
    lgaJurisdiction: string;
  }) {
    await this.sendMail({
      to: data.email,
      subject: `✅ NFSG LGA Coordinator Profile Submitted – ${data.coordinatorId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
          <div style="background: #15803d; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin:0;font-size:22px;">🌾 Nigerian Farmers Support Group</h1>
            <p style="margin:4px 0 0;font-size:14px;opacity:0.9;">LGA Coordinator Registration</p>
          </div>
          <div style="background: white; padding: 28px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <p>Dear <strong>${data.fullName}</strong>,</p>
            <p>Your LGA Coordinator profile has been submitted and is pending review.</p>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
              <table style="width:100%;font-size:14px;">
                <tr><td style="color:#6b7280;">Coordinator ID:</td><td style="font-weight:bold;font-family:monospace;">${data.coordinatorId}</td></tr>
                <tr><td style="color:#6b7280;">Jurisdiction:</td><td>${data.state} | ${data.lgaJurisdiction}</td></tr>
                <tr><td style="color:#6b7280;">Status:</td><td>PENDING REVIEW</td></tr>
              </table>
            </div>
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 8px;font-weight:bold;color:#1d4ed8;">🔑 Verification Code</p>
              <p style="font-family:monospace;font-size:22px;letter-spacing:4px;color:#1e40af;margin:0;">${data.verificationCode}</p>
            </div>
          </div>
        </div>
      `,
    });
  }

  // ─── Admin Welcome Email ────────────────────────────────────────────────────

  async sendAdminWelcome(data: {
    email: string;
    fullName: string;
    username: string;
    password: string;
    role: string;
  }) {
    const adminUrl = this.config.get('ADMIN_URL') || this.config.get('FRONTEND_URL') || 'http://localhost:3000';

    await this.sendMail({
      to: data.email,
      subject: '🔐 NFSG Admin Access – Your Account Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
          <div style="background: #1e40af; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin:0;font-size:22px;">🛡️ NFSG Admin Portal</h1>
            <p style="margin:4px 0 0;font-size:14px;opacity:0.9;">Account Created – Admin Role Assigned</p>
          </div>
          <div style="background: white; padding: 28px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <p>Hello <strong>${data.fullName}</strong>,</p>
            <p>You have been assigned an <strong>${data.role.replace('_', ' ')}</strong> role on the NFSG Platform Admin Portal.</p>

            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:20px 0;">
              <p style="margin:0 0 12px;font-weight:bold;color:#1d4ed8;">Your Login Credentials</p>
              <table style="width:100%;font-size:14px;">
                <tr><td style="color:#6b7280;padding:6px 0;">Email:</td><td style="font-family:monospace;">${data.email}</td></tr>
                <tr><td style="color:#6b7280;padding:6px 0;">Username:</td><td style="font-family:monospace;">${data.username}</td></tr>
                <tr><td style="color:#6b7280;padding:6px 0;">Password:</td><td style="font-family:monospace;font-weight:bold;">${data.password}</td></tr>
                <tr><td style="color:#6b7280;padding:6px 0;">Role:</td><td><span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:4px;">${data.role}</span></td></tr>
              </table>
            </div>

            <div style="text-align:center;margin:24px 0;">
              <a href="${adminUrl}/admin/login" style="background:#1d4ed8;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
                Login to Admin Portal →
              </a>
            </div>

            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#991b1b;">
                ⚠️ Please change your password after your first login. Keep these credentials confidential and do not share them.
              </p>
            </div>

            <p style="font-size:13px;color:#6b7280;">
              Admin URL: <a href="${adminUrl}/admin">${adminUrl}/admin</a>
            </p>
          </div>
        </div>
      `,
    });
  }

  // ─── Status Update Email ────────────────────────────────────────────────────

  async sendStatusUpdate(data: {
    email: string;
    name: string;
    registrationId: string;
    registrationType: string;
    status: 'APPROVED' | 'DECLINED';
    note?: string;
  }) {
    const isApproved = data.status === 'APPROVED';

    await this.sendMail({
      to: data.email,
      subject: `${isApproved ? '✅ Registration Approved' : '❌ Registration Declined'} – ${data.registrationId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
          <div style="background: ${isApproved ? '#15803d' : '#dc2626'}; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin:0;font-size:22px;">${isApproved ? '✅' : '❌'} Registration ${isApproved ? 'Approved' : 'Declined'}</h1>
          </div>
          <div style="background: white; padding: 28px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <p>Dear <strong>${data.name}</strong>,</p>
            <p>Your <strong>${data.registrationType}</strong> registration (${data.registrationId}) has been 
               <strong>${isApproved ? 'approved' : 'declined'}</strong> by the NFSG compliance team.</p>
            ${data.note ? `
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 8px;font-weight:bold;color:#374151;">Note from Admin:</p>
              <p style="margin:0;color:#6b7280;">${data.note}</p>
            </div>
            ` : ''}
            ${isApproved ? '<p>Welcome to the NFSG platform! You will be contacted with further instructions.</p>' : 
              '<p>If you believe this decision was made in error, please contact us at <a href="mailto:support@nfsg.org">support@nfsg.org</a>.</p>'}
          </div>
        </div>
      `,
    });
  }

  // ─── Internal Helper ────────────────────────────────────────────────────────

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

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  // ─── Homepage Metrics ────────────────────────────────────────────────────

  async getHomepageMetrics() {
    const [
      farmersRegistered,
      farmersApproved,
      suppliersApproved,
      distributorsApproved,
    ] = await Promise.all([
      this.prisma.farmer.count(),
      this.prisma.farmer.count({ where: { status: 'APPROVED' } }),
      this.prisma.supplier.count({ where: { status: 'APPROVED' } }),
      this.prisma.distributor.count({ where: { status: 'APPROVED' } }),
    ]);

    return {
      farmersRegistered,
      farmersApproved,
      verifiedDealersLGA: distributorsApproved,
      verifiedSuppliers: suppliersApproved,
    };
  }

  // ─── Universal Status Check by verificationCode ──────────────────────────

  async checkByCode(code: string) {
    const trimmed = code.trim().toUpperCase();

    // Check across all tables
    const farmer = await this.prisma.farmer.findFirst({
      where: { OR: [{ verificationCode: trimmed }, { memberId: trimmed }] },
      select: { memberId: true, fullName: true, status: true, state: true, lga: true, verificationCode: true },
    });
    if (farmer) return { found: true, type: 'farmer', ...farmer };

    const supplier = await this.prisma.supplier.findFirst({
      where: { OR: [{ verificationCode: trimmed }, { supplierId: trimmed }] },
      select: { supplierId: true, repName: true, companyName: true, status: true, verificationCode: true },
    });
    if (supplier) return { found: true, type: 'supplier', ...supplier };

    const distributor = await this.prisma.distributor.findFirst({
      where: { OR: [{ verificationCode: trimmed }, { distributorId: trimmed }] },
      select: { distributorId: true, name: true, companyName: true, state: true, lgaCovered: true, status: true, verificationCode: true },
    });
    if (distributor) return { found: true, type: 'distributor', ...distributor };

    const coordinator = await this.prisma.lgaCoordinator.findFirst({
      where: { OR: [{ verificationCode: trimmed }, { coordinatorId: trimmed }] },
      select: { coordinatorId: true, fullName: true, state: true, lgaJurisdiction: true, status: true, verificationCode: true },
    });
    if (coordinator) return { found: true, type: 'lga-coordinator', ...coordinator };

    return { found: false };
  }

  // ─── Public Allocation Search (masked) ──────────────────────────────────

  async searchAllocation(query: string) {
    const q = (query || '').trim();
    if (q.length < 3) return { found: false };

    const farmer = await this.prisma.farmer.findFirst({
      where: {
        OR: [
          { memberId: { equals: q, mode: 'insensitive' } },
          { fullName: { contains: q, mode: 'insensitive' } },
          { phoneNumber: q },
        ],
        status: 'APPROVED',
      },
      select: { memberId: true, fullName: true, phoneNumber: true, status: true },
    });

    if (!farmer) return { found: false };

    return {
      found: true,
      maskedName: this.maskName(farmer.fullName),
      maskedPhone: this.maskPhone(farmer.phoneNumber),
      memberId: farmer.memberId,
      status: farmer.status,
    };
  }

  // ─── Newsletter Subscribe ────────────────────────────────────────────────

  async subscribeNewsletter(email: string) {
    try {
      await this.prisma.newsletterSubscriber.create({ data: { email } });
    } catch {
      // Already subscribed – not an error we surface
    }
    return { subscribed: true };
  }

  // ─── Simple FAQ Assistant ────────────────────────────────────────────────

  ask(message: string) {
    const q = (message || '').toLowerCase();
    const faqs = [
      {
        keywords: ['nin', 'national', 'id', 'identification'],
        answer: "You will need your 11-digit NIN (National Identification Number) to register as a farmer or LGA Coordinator.",
      },
      {
        keywords: ['vin', 'voter'],
        answer: "You can use your VIN (Voter's Identification Number) as an alternative to NIN for farmer registration.",
      },
      {
        keywords: ['status', 'check', 'verification', 'code'],
        answer: "You can check your registration status at /status using your phone number, Member ID, or the verification code sent to your email.",
      },
      {
        keywords: ['supplier', 'fiss', 'certificate'],
        answer: "Suppliers must have a valid FISS certificate to register. Upload a clear photo of it during registration.",
      },
      {
        keywords: ['distributor', 'naida', 'dealer'],
        answer: "Distributors must be NAIDA-certified and provide their NAIDA certificate during registration.",
      },
      {
        keywords: ['coordinator', 'lga', 'exco'],
        answer: "LGA Coordinators are appointed Executive Committee members. You'll need your appointment slip reference to register.",
      },
      {
        keywords: ['approve', 'approved', 'pending', 'when'],
        answer: "Registration review typically takes 3–5 business days. You'll receive an email notification once your status changes.",
      },
    ];

    const hit = faqs.find(f => f.keywords.some(k => q.includes(k)));
    return {
      reply: hit
        ? hit.answer
        : 'Thanks for your question! Please contact us at support@nfsg.org or try checking your status using your Member ID or verification code.',
    };
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────

  private maskName(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map(word => {
        if (word.length <= 3) return word[0] + '*'.repeat(word.length - 1);
        return word.slice(0, 2) + '*'.repeat(word.length - 3) + word.slice(-1);
      })
      .join(' ');
  }

  private maskPhone(phone: string): string {
    if (phone.length <= 5) return phone;
    return phone.slice(0, 3) + '*'.repeat(phone.length - 5) + phone.slice(-2);
  }
}

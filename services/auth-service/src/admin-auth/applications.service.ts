import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(private prisma: PrismaService) {}

  // ── Vendor Applications ──────────────────────────────────────

  async listVendorApplications(
    status?: string,
    page = 1,
    limit = 20,
  ) {
    const where = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.vendorAccount.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          businessName: true,
          contactName: true,
          phone: true,
          businessType: true,
          businessAddress: true,
          instagramUrl: true,
          websiteUrl: true,
          adminMessage: true,
          venueId: true,
          status: true,
          rejectionReason: true,
          approvedBy: true,
          approvedAt: true,
          createdAt: true,
        },
      }),
      this.prisma.vendorAccount.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async approveVendor(id: string, venueId: string | undefined, approvedBy: string) {
    const vendor = await this.prisma.vendorAccount.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor application not found');

    const updated = await this.prisma.vendorAccount.update({
      where: { id },
      data: {
        status: 'approved',
        venueId: venueId || vendor.venueId,
        approvedBy,
        approvedAt: new Date(),
      },
    });

    // In dev, log instead of sending email
    this.logger.log(
      `[DEV EMAIL] Vendor approved: ${updated.email} — Venue ID: ${updated.venueId}`,
    );

    return { message: 'Vendor approved', vendorId: id };
  }

  async rejectVendor(id: string, reason: string, adminId: string) {
    const vendor = await this.prisma.vendorAccount.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor application not found');

    await this.prisma.vendorAccount.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        approvedBy: adminId,
      },
    });

    this.logger.log(`[DEV EMAIL] Vendor rejected: ${vendor.email} — Reason: ${reason}`);

    return { message: 'Vendor rejected', vendorId: id };
  }

  // ── DJ Applications ──────────────────────────────────────────

  async listDjApplications(
    status?: string,
    page = 1,
    limit = 20,
  ) {
    const where = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.djAccount.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          stageName: true,
          djType: true,
          genres: true,
          bio: true,
          instagramUrl: true,
          phone: true,
          claimType: true,
          claimedProfileId: true,
          djProfileId: true,
          status: true,
          rejectionReason: true,
          approvedBy: true,
          approvedAt: true,
          createdAt: true,
        },
      }),
      this.prisma.djAccount.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async approveDj(id: string, approvedBy: string) {
    const dj = await this.prisma.djAccount.findUnique({ where: { id } });
    if (!dj) throw new NotFoundException('DJ application not found');

    const updateData: Record<string, unknown> = {
      status: 'approved',
      approvedBy,
      approvedAt: new Date(),
    };

    // If claim type is 'claim', link to the claimed profile
    if (dj.claimType === 'claim' && dj.claimedProfileId) {
      updateData.djProfileId = dj.claimedProfileId;
      this.logger.log(
        `DJ ${dj.email} linked to claimed profile: ${dj.claimedProfileId}`,
      );
    } else {
      // For 'new' DJs, a profile will be created by the content service later.
      // For now just mark approved — the djProfileId will be set when profile is created.
      this.logger.log(
        `DJ ${dj.email} approved as new — profile to be created by content service`,
      );
    }

    await this.prisma.djAccount.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`[DEV EMAIL] DJ approved: ${dj.email}`);

    return { message: 'DJ approved', djId: id };
  }

  async rejectDj(id: string, reason: string, adminId: string) {
    const dj = await this.prisma.djAccount.findUnique({ where: { id } });
    if (!dj) throw new NotFoundException('DJ application not found');

    await this.prisma.djAccount.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        approvedBy: adminId,
      },
    });

    this.logger.log(`[DEV EMAIL] DJ rejected: ${dj.email} — Reason: ${reason}`);

    return { message: 'DJ rejected', djId: id };
  }
}

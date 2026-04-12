import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Request } from 'express';

@UseGuards(AdminGuard)
@Controller('admin')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // ── Vendor Applications ──────────────────────────────────────

  @Get('vendor-applications')
  listVendorApplications(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.applicationsService.listVendorApplications(
      status,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('vendor-applications/:id/approve')
  approveVendor(
    @Param('id') id: string,
    @Body() body: { venueId?: string },
    @Req() req: Request,
  ) {
    const { userId } = req.user as { userId: string };
    return this.applicationsService.approveVendor(id, body.venueId, userId);
  }

  @Post('vendor-applications/:id/reject')
  rejectVendor(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Req() req: Request,
  ) {
    const { userId } = req.user as { userId: string };
    return this.applicationsService.rejectVendor(id, body.reason, userId);
  }

  // ── DJ Applications ──────────────────────────────────────────

  @Get('dj-applications')
  listDjApplications(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.applicationsService.listDjApplications(
      status,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('dj-applications/:id/approve')
  approveDj(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const { userId } = req.user as { userId: string };
    return this.applicationsService.approveDj(id, userId);
  }

  @Post('dj-applications/:id/reject')
  rejectDj(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Req() req: Request,
  ) {
    const { userId } = req.user as { userId: string };
    return this.applicationsService.rejectDj(id, body.reason, userId);
  }
}

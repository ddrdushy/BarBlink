import { Controller, Get, Query, Param } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { NearbyQueryDto, SearchQueryDto } from './dto/nearby-query.dto';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get('nearby')
  nearby(@Query() query: NearbyQueryDto) {
    return this.discoveryService.nearby(
      query.lat, query.lng, query.radius || 5000,
      query.category, query.country,
    );
  }

  @Get('search')
  search(@Query() query: SearchQueryDto) {
    return this.discoveryService.search(query.q, query.country);
  }

  @Get('map')
  map(@Query('country') country?: string) {
    return this.discoveryService.mapData(country);
  }

  @Get('crowd/:venueId')
  crowd(@Param('venueId') venueId: string) {
    return this.discoveryService.crowdForVenue(venueId);
  }
}

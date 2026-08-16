import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@auth/presentation/guards/jwt-auth.guard';
import {
  PLACE_SEARCH_PORT,
  type PlaceSearchPort,
} from '@geo/domain/ports/place-search.port';
import {
  AutocompletePlacesDto,
  PlaceDetailsDto,
  ReverseGeocodeDto,
} from './dto/geo.dto';

/**
 * Proxy do Google Places — mobilka wyszukuje miejsca treningów, a klucz API
 * zostaje po tej stronie. Tylko odczyt, więc nic tu nie trafia do bazy.
 */
@Controller('geo')
@UseGuards(JwtAuthGuard)
export class GeoController {
  constructor(
    @Inject(PLACE_SEARCH_PORT)
    private readonly places: PlaceSearchPort,
  ) {}

  // Musi stać przed `places/:placeId`, inaczej `autocomplete` wpadnie jako id.
  @Get('places/autocomplete')
  autocomplete(@Query() query: AutocompletePlacesDto) {
    return this.places.autocomplete({
      query: query.query,
      sessionToken: query.sessionToken,
      bias:
        query.lat !== undefined && query.lng !== undefined
          ? { lat: query.lat, lng: query.lng }
          : undefined,
    });
  }

  @Get('places/:placeId')
  details(@Param('placeId') placeId: string, @Query() query: PlaceDetailsDto) {
    return this.places.details({
      placeId,
      sessionToken: query.sessionToken,
    });
  }

  @Get('reverse')
  reverse(@Query() query: ReverseGeocodeDto) {
    return this.places.reverseGeocode({ lat: query.lat, lng: query.lng });
  }
}

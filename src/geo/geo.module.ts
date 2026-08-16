import { Module } from '@nestjs/common';
import { AuthModule } from '@auth/auth.module';
import { PLACE_SEARCH_PORT } from '@geo/domain/ports/place-search.port';
import { GooglePlacesAdapter } from '@geo/infrastructure/adapters/google-places.adapter';
import { GeoController } from '@geo/presentation/geo.controller';

@Module({
  imports: [AuthModule],
  controllers: [GeoController],
  providers: [{ provide: PLACE_SEARCH_PORT, useClass: GooglePlacesAdapter }],
})
export class GeoModule {}

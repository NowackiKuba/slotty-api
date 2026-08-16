import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const autocompletePlacesSchema = z.object({
  query: z.string().trim().min(2).max(200),
  sessionToken: z.string().max(100).optional(),
  /** Środek mapy, którą klient ogląda — podpowiedzi bliżej niego. */
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export class AutocompletePlacesDto extends createZodDto(
  autocompletePlacesSchema,
) {}

export const placeDetailsSchema = z.object({
  sessionToken: z.string().max(100).optional(),
});

export class PlaceDetailsDto extends createZodDto(placeDetailsSchema) {}

export const reverseGeocodeSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export class ReverseGeocodeDto extends createZodDto(reverseGeocodeSchema) {}

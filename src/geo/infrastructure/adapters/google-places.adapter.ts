import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  PlaceDetails,
  PlaceSearchPort,
  PlaceSuggestion,
  ReverseGeocodeResult,
} from '@geo/domain/ports/place-search.port';

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const DETAILS_URL = 'https://places.googleapis.com/v1/places';
const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

const DETAILS_FIELD_MASK = 'id,displayName,formattedAddress,location';

/** Podpowiedzi i adresy są po polsku — aplikacja mobilna też. */
const LANGUAGE_CODE = 'pl';
const REGION_CODE = 'pl';

/** Promień podpowiedzi wokół mapy, którą trener właśnie ogląda. */
const BIAS_RADIUS_METERS = 30_000;

interface AutocompleteResponse {
  suggestions?: {
    placePrediction?: {
      placeId: string;
      text?: { text?: string };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }[];
}

interface DetailsResponse {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
}

interface GeocodeResponse {
  status: string;
  results?: { formatted_address?: string }[];
}

/**
 * Klucz Google zostaje na serwerze: aplikacja mobilna wysyła tylko frazę, więc
 * nikt nie wyciągnie klucza z bundla i nie nabije rachunku.
 */
@Injectable()
export class GooglePlacesAdapter implements PlaceSearchPort {
  private readonly logger = new Logger(GooglePlacesAdapter.name);

  constructor(private readonly config: ConfigService) {}

  async autocomplete(input: {
    query: string;
    sessionToken?: string;
    bias?: { lat: number; lng: number };
  }): Promise<PlaceSuggestion[]> {
    const body: Record<string, unknown> = {
      input: input.query,
      languageCode: LANGUAGE_CODE,
      regionCode: REGION_CODE,
    };

    if (input.sessionToken) body.sessionToken = input.sessionToken;

    if (input.bias) {
      body.locationBias = {
        circle: {
          center: { latitude: input.bias.lat, longitude: input.bias.lng },
          radius: BIAS_RADIUS_METERS,
        },
      };
    }

    const response = await this.request(AUTOCOMPLETE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey(),
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as AutocompleteResponse;

    return (data.suggestions ?? [])
      .map((suggestion) => suggestion.placePrediction)
      .filter((prediction) => prediction?.placeId)
      .map((prediction) => ({
        placeId: prediction!.placeId,
        name:
          prediction!.structuredFormat?.mainText?.text ??
          prediction!.text?.text ??
          '',
        address: prediction!.structuredFormat?.secondaryText?.text ?? '',
      }));
  }

  async details(input: {
    placeId: string;
    sessionToken?: string;
  }): Promise<PlaceDetails> {
    const url = new URL(`${DETAILS_URL}/${encodeURIComponent(input.placeId)}`);
    url.searchParams.set('languageCode', LANGUAGE_CODE);
    url.searchParams.set('regionCode', REGION_CODE);
    if (input.sessionToken) {
      url.searchParams.set('sessionToken', input.sessionToken);
    }

    const response = await this.request(url.toString(), {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': this.apiKey(),
        'X-Goog-FieldMask': DETAILS_FIELD_MASK,
      },
    });

    const data = (await response.json()) as DetailsResponse;
    const lat = data.location?.latitude;
    const lng = data.location?.longitude;

    // Bez współrzędnych szczegóły są bezużyteczne — profil trenera trzyma punkt.
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw new NotFoundException('place has no coordinates');
    }

    return {
      placeId: data.id ?? input.placeId,
      name: data.displayName?.text ?? '',
      address: data.formattedAddress ?? '',
      lat,
      lng,
    };
  }

  async reverseGeocode(input: {
    lat: number;
    lng: number;
  }): Promise<ReverseGeocodeResult> {
    const url = new URL(GEOCODE_URL);
    url.searchParams.set('latlng', `${input.lat},${input.lng}`);
    url.searchParams.set('language', LANGUAGE_CODE);
    url.searchParams.set('key', this.apiKey());

    const response = await this.request(url.toString(), { method: 'GET' });
    const data = (await response.json()) as GeocodeResponse;

    // `ZERO_RESULTS` to poprawna odpowiedź: pinezka na środku lasu nie ma adresu.
    if (data.status === 'ZERO_RESULTS') return { address: null };

    if (data.status !== 'OK') {
      this.logger.error(`google geocode failed: ${data.status}`);
      throw new ServiceUnavailableException('geocoding unavailable');
    }

    return { address: data.results?.[0]?.formatted_address ?? null };
  }

  private apiKey(): string {
    const key = this.config.get<string>('GOOGLE_PLACES_API_KEY');

    if (!key) {
      this.logger.error('GOOGLE_PLACES_API_KEY is not configured');
      throw new ServiceUnavailableException('place search unavailable');
    }

    return key;
  }

  private async request(url: string, init: RequestInit): Promise<Response> {
    let response: Response;

    try {
      response = await fetch(url, init);
    } catch (error) {
      this.logger.error(`google places request failed: ${String(error)}`);
      throw new ServiceUnavailableException('place search unavailable');
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      this.logger.error(
        `google places responded ${response.status}: ${detail.slice(0, 500)}`,
      );
      throw new ServiceUnavailableException('place search unavailable');
    }

    return response;
  }
}

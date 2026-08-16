export interface PlaceSuggestion {
  placeId: string;
  /** Główna linia podpowiedzi — nazwa obiektu albo ulica z numerem. */
  name: string;
  /** Druga linia — reszta adresu. */
  address: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface ReverseGeocodeResult {
  address: string | null;
}

export interface PlaceSearchPort {
  /**
   * `sessionToken` łączy podpowiedzi z jednym `details` w jedną sesję
   * billingową — klient generuje go raz na otwarcie wyszukiwarki.
   */
  autocomplete(input: {
    query: string;
    sessionToken?: string;
    bias?: { lat: number; lng: number };
  }): Promise<PlaceSuggestion[]>;

  details(input: {
    placeId: string;
    sessionToken?: string;
  }): Promise<PlaceDetails>;

  reverseGeocode(input: {
    lat: number;
    lng: number;
  }): Promise<ReverseGeocodeResult>;
}

export const PLACE_SEARCH_PORT = Symbol('PLACE_SEARCH_PORT');

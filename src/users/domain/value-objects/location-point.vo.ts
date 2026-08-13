import { InvalidLocationPointException } from '@users/domain/exceptions/profile';

export type LocationPointProps = {
  name?: string;
  address?: string;
  lat: number;
  lng: number;
};

export class LocationPoint {
  private constructor(
    private readonly _lat: number,
    private readonly _lng: number,
    private readonly _name?: string,
    private readonly _address?: string,
  ) {}

  static create(props: LocationPointProps): LocationPoint {
    if (!Number.isFinite(props.lat) || props.lat < -90 || props.lat > 90) {
      throw new InvalidLocationPointException({
        lat: props.lat,
        reason: 'latitude must be between -90 and 90',
      });
    }

    if (!Number.isFinite(props.lng) || props.lng < -180 || props.lng > 180) {
      throw new InvalidLocationPointException({
        lng: props.lng,
        reason: 'longitude must be between -180 and 180',
      });
    }

    const name = props.name?.trim() || undefined;
    const address = props.address?.trim() || undefined;

    return new LocationPoint(props.lat, props.lng, name, address);
  }

  get lat(): number {
    return this._lat;
  }

  get lng(): number {
    return this._lng;
  }

  get name(): string | undefined {
    return this._name;
  }

  get address(): string | undefined {
    return this._address;
  }

  equals(other: LocationPoint): boolean {
    return (
      this._lat === other._lat &&
      this._lng === other._lng &&
      this._name === other._name &&
      this._address === other._address
    );
  }

  toProps(): LocationPointProps {
    return {
      lat: this._lat,
      lng: this._lng,
      name: this._name,
      address: this._address,
    };
  }
}

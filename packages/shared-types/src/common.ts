export type ISODateTime = string;
export type ISODate = string;
export type UUID = string;

export type CountryCode = 'MY' | 'LK' | (string & {});

export type Area = string;

export interface AreaEntry {
  id: string;
  label: string;
  city: string;
  country: CountryCode;
}

export const AREAS: AreaEntry[] = [
  // Malaysia — Kuala Lumpur
  { id: 'bukit_bintang', label: 'Bukit Bintang', city: 'Kuala Lumpur', country: 'MY' },
  { id: 'klcc', label: 'KLCC', city: 'Kuala Lumpur', country: 'MY' },
  { id: 'bangsar', label: 'Bangsar', city: 'Kuala Lumpur', country: 'MY' },
  { id: 'mont_kiara', label: 'Mont Kiara', city: 'Kuala Lumpur', country: 'MY' },
  { id: 'hartamas', label: 'Sri Hartamas', city: 'Kuala Lumpur', country: 'MY' },
  { id: 'desa_parkcity', label: 'Desa ParkCity', city: 'Kuala Lumpur', country: 'MY' },
  { id: 'chinatown', label: 'Chinatown', city: 'Kuala Lumpur', country: 'MY' },
  { id: 'trec', label: 'TREC', city: 'Kuala Lumpur', country: 'MY' },
  { id: 'changkat', label: 'Changkat', city: 'Kuala Lumpur', country: 'MY' },
  { id: 'damansara', label: 'Damansara', city: 'Kuala Lumpur', country: 'MY' },
  // Sri Lanka — Colombo
  { id: 'kollupitiya', label: 'Kollupitiya', city: 'Colombo', country: 'LK' },
  { id: 'bambalapitiya', label: 'Bambalapitiya', city: 'Colombo', country: 'LK' },
  { id: 'cinnamon_gardens', label: 'Cinnamon Gardens', city: 'Colombo', country: 'LK' },
  { id: 'fort', label: 'Fort', city: 'Colombo', country: 'LK' },
  { id: 'mount_lavinia', label: 'Mount Lavinia', city: 'Colombo', country: 'LK' },
];

export type CrowdStatus = 'quiet' | 'lively' | 'packed';

export interface GpsPoint {
  lat: number;
  lng: number;
}

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
  total?: number;
}

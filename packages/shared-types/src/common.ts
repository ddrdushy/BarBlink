export type ISODateTime = string;
export type ISODate = string;
export type UUID = string;

export type Area =
  | 'bukit_bintang'
  | 'klcc'
  | 'bangsar'
  | 'mont_kiara'
  | 'hartamas'
  | 'desa_parkcity'
  | 'chinatown'
  | 'trec'
  | 'changkat'
  | 'damansara';

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

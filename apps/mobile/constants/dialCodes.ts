export interface DialCountry {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
  maxLocalDigits: number;
}

export const PRIORITY_COUNTRIES: DialCountry[] = [
  { code: 'MY', dialCode: '+60', flag: '\u{1F1F2}\u{1F1FE}', name: 'Malaysia', maxLocalDigits: 11 },
  { code: 'LK', dialCode: '+94', flag: '\u{1F1F1}\u{1F1F0}', name: 'Sri Lanka', maxLocalDigits: 10 },
];

export const OTHER_COUNTRIES: DialCountry[] = [
  { code: 'SG', dialCode: '+65', flag: '\u{1F1F8}\u{1F1EC}', name: 'Singapore', maxLocalDigits: 8 },
  { code: 'IN', dialCode: '+91', flag: '\u{1F1EE}\u{1F1F3}', name: 'India', maxLocalDigits: 10 },
  { code: 'AU', dialCode: '+61', flag: '\u{1F1E6}\u{1F1FA}', name: 'Australia', maxLocalDigits: 9 },
  { code: 'GB', dialCode: '+44', flag: '\u{1F1EC}\u{1F1E7}', name: 'UK', maxLocalDigits: 10 },
  { code: 'US', dialCode: '+1', flag: '\u{1F1FA}\u{1F1F8}', name: 'USA', maxLocalDigits: 10 },
  { code: 'CN', dialCode: '+86', flag: '\u{1F1E8}\u{1F1F3}', name: 'China', maxLocalDigits: 11 },
  { code: 'JP', dialCode: '+81', flag: '\u{1F1EF}\u{1F1F5}', name: 'Japan', maxLocalDigits: 11 },
  { code: 'ID', dialCode: '+62', flag: '\u{1F1EE}\u{1F1E9}', name: 'Indonesia', maxLocalDigits: 12 },
  { code: 'PH', dialCode: '+63', flag: '\u{1F1F5}\u{1F1ED}', name: 'Philippines', maxLocalDigits: 10 },
  { code: 'TH', dialCode: '+66', flag: '\u{1F1F9}\u{1F1ED}', name: 'Thailand', maxLocalDigits: 9 },
];

export const ALL_COUNTRIES: DialCountry[] = [...PRIORITY_COUNTRIES, ...OTHER_COUNTRIES];

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'officer' | 'user';
}

export interface PoliceStation {
  id: string;
  name: string;
  address: string;
  contact: string;
  officerCount: number;
}

export interface Officer {
  id: string;
  name: string;
  badgeNumber: string;
  rank: string;
  stationId: string;
  stationName?: string;
}

export interface Criminal {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  status: 'active' | 'incarcerated' | 'released' | 'wanted';
  lastCrimeDate: string;
  crimeTypes: string[];
  photoUrl?: string;
}

export interface FirDetail {
  id: string;
  complainantName: string;
  complainantId: string;
  dateFiled: string;
  incidentType: string;
  stationId: string;
  stationName: string;
  status: 'new' | 'investigating' | 'resolved' | 'closed';
}

export interface Crime {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  criminalIds: string[];
  status: 'open' | 'closed' | 'under_investigation';
}

export interface CrimeType {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Profile {
  id: string;
  userId: string;
  address: string;
  phoneNumber: string;
  email: string;
}

export interface Activity {
  id: string;
  description: string;
  type: 'new' | 'updated' | 'progress';
  location: string;
  officer: string;
  timestamp: string;
}

export interface StatsData {
  totalCrimes: number;
  activeCases: number;
  criminalRecords: number;
  firReports: number;
}

export interface ChartData {
  crimeTypeDistribution: {
    labels: string[];
    data: number[];
  };
  monthlyCrimeTrends: {
    labels: string[];
    data: number[];
  };
}

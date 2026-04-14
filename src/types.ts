export interface Band {
  id: string;
  name: string;
  genre: string;
  origin: string;
  videos: string[];
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  logo?: string;
}

export interface Match {
  id: string;
  stage: string;
  group?: string;
  band1Id: string;
  band2Id: string;
  date: string; // ISO string
  durationMinutes: number;
  result?: {
    band1Votes: number;
    band2Votes: number;
  };
}

export interface Sponsor {
  name: string;
  logo: string;
  type: string;
}

export interface Vote {
  matchId: string;
  userId: string;
  bandId: string;
  timestamp: any;
}

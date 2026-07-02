export type CartItem = {
  beatId: string;
  beatTitle: string;
  beatSlug: string;
  artworkUrl: string | null;
  licenseId: string;
  licenseName: string;
  price: number;
  agreementAccepted: boolean;
};

export type BeatWithLicenses = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  artworkUrl: string | null;
  previewUrl: string | null;
  bpm: number;
  key: string;
  genre: string;
  mood: string;
  tags: string[];
  playCount: number;
  featured: boolean;
  exclusiveSold: boolean;
  createdAt: string;
  licenses: {
    id: string;
    name: string;
    price: number;
    fileFormats: string[];
    streamLimit: number | null;
    distributionLimit: number | null;
    musicVideos: boolean;
    performanceRights: boolean;
    commercialUse: boolean;
    isExclusive: boolean;
    agreementText: string;
  }[];
};

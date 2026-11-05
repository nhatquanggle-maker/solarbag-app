export interface HardwareState {
  connected: boolean;
  deviceName: string;
  edition: string;
  serial: string;
  batteryLevel: number;
  chargingState: 'CHARGING' | 'DISCHARGING' | 'FULL';
  solarInputWatts: number;
  topPillWatts: number;
  dailyWhHarvested: number;
  targetWh: number;
  lampState: 'ON' | 'OFF';
  brightness: number;
  sosFlashActive: boolean;
  bleDistanceMeters: number;
  bleDirection: string;
  lastSeen: string;
  nfcRegistered: boolean;
  healthPercent: number;
}

export interface Waypoint {
  name: string;
  type: 'camp' | 'water' | 'photo' | 'summit' | 'alert';
  dist?: string;
  lat: number;
  lng: number;
  note?: string;
}

export interface Trail {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  length: string;
  duration: string;
  region: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  statusBadge: string;
  elevationGain: string;
  summitAltitude: string;
  image: string;
  coordinates: [number, number];
  center: [number, number];
  path: [number, number][];
  waypoints: Waypoint[];
  offlineAvailable: boolean;
  packageSize: string;
}

export interface CrewMember {
  id: string;
  name: string;
  initials: string;
  status: string;
  lat: number;
  lng: number;
  altitude: number;
  speed: string;
  battery: string;
  distanceToMe: string;
}

export interface FeedPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    location: string;
    timeAgo: string;
  };
  caption: string;
  metrics: {
    distance: string;
    elevation: string;
    type: string;
  };
  photo: string;
  mapPreview: string;
  likes: number;
  hasLiked: boolean;
  comments: {
    id: string;
    author: string;
    text: string;
    time: string;
  }[];
}

export interface Challenge {
  id: string;
  title: string;
  progress: number;
  target: number;
  unit: string;
  percentage: number;
  badgeName: string;
  rewardNote: string;
}

export interface Trophy {
  id: string;
  name: string;
  icon: 'sun' | 'trophy' | 'mountain' | 'sprout';
  unlocked: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  notifySms: boolean;
  notifyZalo: boolean;
}

export interface FloraFaunaItem {
  id: string;
  commonName: string;
  scientificName: string;
  localName: string;
  toxicity: string;
  isToxic: boolean;
  safetyInstruction: string;
  status: string;
  confidence: string;
  habitat: string;
  recommendation: string;
}


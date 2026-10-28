export type UserRole = 'admin' | 'student' | 'teacher';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  assignedRouteId?: string;
  createdAt: string;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  source: string;
  destination: string;
  category: 'Campus & University' | 'City Express' | 'Metro Feeder' | 'Suburban / Outstation' | 'Night Service';
  intermediateStops: string[];
  morningTiming: string;
  eveningTiming: string;
  frequency: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  currentOccupancy: 'Low' | 'Medium' | 'Full';
  status: 'On Time' | 'Departing Soon' | 'In Transit' | 'Delayed';
  delayMinutes?: number;
  isVerified: boolean;
  verificationNotes?: string;
  fare: string;
  totalDistanceKm: number;
  lastUpdated: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: 'normal' | 'important' | 'urgent';
  targetAudience: 'all' | 'students' | 'teachers';
}

export interface ThemeSettings {
  accentColor: string;
  backgroundImageUrl: string | null;
  backgroundPlacement: 'dashboard' | 'header' | 'route-board';
  brightness: number; // 50 to 150
  contrast: number;   // 50 to 150
  saturation: number; // 0 to 200
  hueRotate: number;  // 0 to 360
  filterPreset: 'none' | 'grayscale' | 'vintage' | 'warm' | 'cool' | 'high-contrast';
  imagePosition: 'center' | 'top' | 'bottom';
  imageFit: 'cover' | 'contain';
  overlayOpacity: number; // 0 to 90
}

// Types for Mini Dating App

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bio: string;
  email: string;
  createdAt: number;
}

export interface Like {
  id: string;
  fromUserId: string;
  toUserId: string;
  timestamp: number;
}

export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  matchedAt: number;
  userAAvailability?: AvailabilitySlot[];
  userBAvailability?: AvailabilitySlot[];
  scheduledDate?: ScheduledDate;
}

export interface AvailabilitySlot {
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:mm
  endTime: string; // Format: HH:mm
}

export interface ScheduledDate {
  date: string;
  startTime: string;
  endTime: string;
}

export type ViewState = 'home' | 'login' | 'create-profile' | 'profiles' | 'matches' | 'schedule';

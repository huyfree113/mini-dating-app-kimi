// API sử dụng LocalStorage - cho phiên bản deploy không có backend

import type { Profile, Like, Match, AvailabilitySlot, ScheduledDate } from '@/types';

const STORAGE_KEYS = {
  profiles: 'dating_app_profiles',
  likes: 'dating_app_likes',
  matches: 'dating_app_matches',
};

// Helper functions
function readData(key: string): any[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function writeData(key: string, data: any[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Auth API
export const authAPI = {
  login: async (email: string) => {
    const profiles = readData(STORAGE_KEYS.profiles);
    const profile = profiles.find((p: Profile) => p.email.toLowerCase() === email.toLowerCase());
    
    if (!profile) {
      throw new Error('Email không tồn tại');
    }
    
    return { success: true, profile };
  },
};

// Profile API
export const profileAPI = {
  getAll: async () => {
    return readData(STORAGE_KEYS.profiles);
  },
  
  getById: async (id: string) => {
    const profiles = readData(STORAGE_KEYS.profiles);
    return profiles.find((p: Profile) => p.id === id);
  },
  
  create: async (profile: { name: string; age: number; gender: string; bio: string; email: string }) => {
    const profiles = readData(STORAGE_KEYS.profiles);
    
    // Check if email exists
    if (profiles.some((p: Profile) => p.email.toLowerCase() === profile.email.toLowerCase())) {
      throw new Error('Email đã tồn tại');
    }
    
    const newProfile: Profile = {
      id: generateId(),
      name: profile.name,
      age: profile.age,
      gender: profile.gender as 'male' | 'female' | 'other',
      bio: profile.bio,
      email: profile.email,
      createdAt: Date.now(),
    };
    
    profiles.push(newProfile);
    writeData(STORAGE_KEYS.profiles, profiles);
    
    return { success: true, profile: newProfile };
  },
};

// Like API
export const likeAPI = {
  getByUser: async (userId: string) => {
    const likes = readData(STORAGE_KEYS.likes);
    return likes.filter((l: Like) => l.fromUserId === userId);
  },
  
  create: async (fromUserId: string, toUserId: string) => {
    if (fromUserId === toUserId) {
      throw new Error('Cannot like yourself');
    }
    
    const likes = readData(STORAGE_KEYS.likes);
    
    // Check if already liked
    if (likes.some((l: Like) => l.fromUserId === fromUserId && l.toUserId === toUserId)) {
      throw new Error('Already liked this user');
    }
    
    const newLike: Like = {
      id: generateId(),
      fromUserId,
      toUserId,
      timestamp: Date.now(),
    };
    
    likes.push(newLike);
    writeData(STORAGE_KEYS.likes, likes);
    
    // Check for mutual like
    const mutualLike = likes.find((l: Like) => l.fromUserId === toUserId && l.toUserId === fromUserId);
    
    let match = null;
    if (mutualLike) {
      const matches = readData(STORAGE_KEYS.matches);
      
      // Check if match already exists
      const existingMatch = matches.find((m: Match) => 
        (m.userAId === fromUserId && m.userBId === toUserId) ||
        (m.userAId === toUserId && m.userBId === fromUserId)
      );
      
      if (!existingMatch) {
        match = {
          id: generateId(),
          userAId: fromUserId,
          userBId: toUserId,
          matchedAt: Date.now(),
          userAAvailability: [],
          userBAvailability: [],
          scheduledDate: null,
        };
        
        matches.push(match);
        writeData(STORAGE_KEYS.matches, matches);
      }
    }
    
    return { 
      success: true, 
      like: newLike, 
      isMatch: !!match,
      match 
    };
  },
};

// Match API
export const matchAPI = {
  getByUser: async (userId: string) => {
    const matches = readData(STORAGE_KEYS.matches);
    return matches.filter((m: Match) => m.userAId === userId || m.userBId === userId);
  },
  
  getById: async (matchId: string) => {
    const matches = readData(STORAGE_KEYS.matches);
    return matches.find((m: Match) => m.id === matchId);
  },
  
  updateAvailability: async (matchId: string, userId: string, availability: AvailabilitySlot[]) => {
    const matches = readData(STORAGE_KEYS.matches);
    const matchIndex = matches.findIndex((m: Match) => m.id === matchId);
    
    if (matchIndex === -1) {
      throw new Error('Match not found');
    }
    
    if (matches[matchIndex].userAId === userId) {
      matches[matchIndex].userAAvailability = availability;
    } else if (matches[matchIndex].userBId === userId) {
      matches[matchIndex].userBAvailability = availability;
    } else {
      throw new Error('User not part of this match');
    }
    
    writeData(STORAGE_KEYS.matches, matches);
    return { success: true, match: matches[matchIndex] };
  },
  
  updateSchedule: async (matchId: string, scheduledDate: ScheduledDate) => {
    const matches = readData(STORAGE_KEYS.matches);
    const matchIndex = matches.findIndex((m: Match) => m.id === matchId);
    
    if (matchIndex === -1) {
      throw new Error('Match not found');
    }
    
    matches[matchIndex].scheduledDate = scheduledDate;
    writeData(STORAGE_KEYS.matches, matches);
    
    return { success: true, match: matches[matchIndex] };
  },
  
  findCommonSlot: async (matchId: string) => {
    const matches = readData(STORAGE_KEYS.matches);
    const match = matches.find((m: Match) => m.id === matchId);
    
    if (!match) {
      throw new Error('Match not found');
    }
    
    const userAAvailability = match.userAAvailability || [];
    const userBAvailability = match.userBAvailability || [];
    
    if (userAAvailability.length === 0 || userBAvailability.length === 0) {
      return { 
        success: false, 
        message: 'Both users must select availability first' 
      };
    }
    
    // Find first common slot
    let commonSlot: ScheduledDate | null = null;
    
    for (const slotA of userAAvailability) {
      for (const slotB of userBAvailability) {
        if (slotA.date === slotB.date) {
          const startA = slotA.startTime;
          const endA = slotA.endTime;
          const startB = slotB.startTime;
          const endB = slotB.endTime;
          
          const overlapStart = startA > startB ? startA : startB;
          const overlapEnd = endA < endB ? endA : endB;
          
          if (overlapStart < overlapEnd) {
            commonSlot = {
              date: slotA.date,
              startTime: overlapStart,
              endTime: overlapEnd,
            };
            break;
          }
        }
      }
      if (commonSlot) break;
    }
    
    if (commonSlot) {
      match.scheduledDate = commonSlot;
      const matchIndex = matches.findIndex((m: Match) => m.id === matchId);
      matches[matchIndex] = match;
      writeData(STORAGE_KEYS.matches, matches);
      
      return {
        success: true,
        message: `Date scheduled`,
        scheduledDate: commonSlot,
      };
    }
    
    return {
      success: false,
      message: 'No common time slot found. Please update your availability.',
    };
  },
};

// Admin API
export const adminAPI = {
  reset: async () => {
    writeData(STORAGE_KEYS.profiles, []);
    writeData(STORAGE_KEYS.likes, []);
    writeData(STORAGE_KEYS.matches, []);
    return { success: true, message: 'All data reset' };
  },
  
  seed: async () => {
    const profiles = [
      {
        id: generateId(),
        name: 'Nguyễn Văn A',
        age: 25,
        gender: 'male',
        bio: 'Thích đọc sách, du lịch và cà phê cuối tuần.',
        email: 'nguyenvana@example.com',
        createdAt: Date.now(),
      },
      {
        id: generateId(),
        name: 'Trần Thị B',
        age: 23,
        gender: 'female',
        bio: 'Yêu thích âm nhạc, phim ảnh và nấu ăn.',
        email: 'tranthib@example.com',
        createdAt: Date.now(),
      },
      {
        id: generateId(),
        name: 'Lê Văn C',
        age: 27,
        gender: 'male',
        bio: 'Thể thao, gym và công nghệ.',
        email: 'levanc@example.com',
        createdAt: Date.now(),
      },
    ];
    
    writeData(STORAGE_KEYS.profiles, profiles);
    writeData(STORAGE_KEYS.likes, []);
    writeData(STORAGE_KEYS.matches, []);
    
    return { success: true, profiles };
  },
};

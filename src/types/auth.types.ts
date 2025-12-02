// src/types/auth.types.ts

// ========== ADMIN TYPES ==========
export interface AdminTypes {
  id: number;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminResponse {
  id: number;
  username: string;
  createdAt: string;
  updatedAt: string;
}

// ========== MEETING TYPES ==========
export interface MeetingTypes {
  id: number;
  title: string;
  meeting_date: string; // formato: YYYY-MM-DD
  start_time: string; // formato: HH:MM:SS
  end_time: string; // formato: HH:MM:SS
  location: string;
  participants_count: number;
  description: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface CreateMeetingInput {
  title: string;
  meeting_date: string;
  start_time: string;
  end_time: string;
  location: string;
  participants_count: number;
  description?: string;
}

export interface UpdateMeetingInput {
  title?: string;
  meeting_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  participants_count?: number;
  description?: string;
}

// ========== LDAP TYPES ==========

// ========== LOGIN/AUTH TYPES ==========
export interface UserLoginCredentials {
  user: string;
  password: string;
}

export interface UserCredentials {
  user: string;
  password: string;
  departments: string;
}

export interface AdminLoginCredentials {
  user: string;
  password: string;
}

export interface AdminCredentials {
  user: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    username: string;
    email?: string;
    displayName?: string;
    groups?: string[];
  };
}

// src/types/auth.types.ts

export interface LDAPConfig {
  url: string;
  baseDN: string;
  timeout: number;
  adminDN?: string;
  adminPassword?: string;
}

export interface LDAPUser {
  username: string;
  email?: string;
  displayName?: string;
  groups?: string[];
  dn?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    username: string;
    email?: string;
    displayName?: string;
    groups?: string[];
  };
}
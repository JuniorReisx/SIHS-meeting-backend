export interface AdminTypes {
  id: number;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserTypes {
  id: number;
  username: string;
  password?: string;
  department: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminResponse {
  id: number;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingTypes {
  id: number;
  title: string;
  meeting_date: string;
  start_time: string;
  end_time: string;
  location: string;
  participants_count: number;
  description: string | null;
  created_at: string;
  updated_at: string;
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

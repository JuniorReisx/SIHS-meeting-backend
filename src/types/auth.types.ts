

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

export interface LDAPConfig {
  url: string;
  baseDN: string;
  timeout?: number;
}

export interface LDAPUser {
  dn: string;
  username: string;
  email?: string;
  displayName?: string;
  groups?: string[];
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

export interface AdminTypes {
  id: number;
  username: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminResponse {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingTypes {
  id?: number;
  title: string;
  date: string;
  time: string;
  location?: string;
  participants?: string[];
  description?: string;
  organizer?: string;
  status?: string;
  duration?: number;
  created_at?: string;
  updated_at?: string;
}
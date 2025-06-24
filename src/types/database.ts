// Database Types for the new structure

export interface Owner {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  
  // Location Information
  country: string;
  state?: string;
  municipality?: string;
  neighborhood?: string;
  street?: string;
  postal_code?: string;
  
  // Professional Information
  experience_years?: number;
  properties_sold?: number;
  commission_percentage?: number;
  
  // Agency Information
  works_at_agency: boolean;
  agency_name?: string;
  
  // Description
  description?: string;
  
  // Subscription Information
  subscription_plan?: 'basic' | 'premium' | 'enterprise' | 'mensual' | 'semanal' | 'anual';
  subscription_status: 'active' | 'cancelled' | 'expired';
  subscription_start_date?: string;
  subscription_end_date?: string;
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_verified: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  
  // Property Information
  intent: 'venta' | 'renta';
  timeline?: string;
  price: number;
  property_type: string;
  documentation?: string;
  
  // Location Information
  country: string;
  state: string;
  municipality: string;
  neighborhood?: string;
  street?: string;
  postal_code?: string;
  
  // Property Characteristics
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number;
  construction_area?: number; // in square meters
  land_area?: number; // in square meters
  
  // Media and Description
  images?: string[]; // Array of image URLs
  description?: string;
  
  // Commission
  commission_percentage: number;
  
  // Status
  status: 'active' | 'inactive' | 'sold' | 'rented';
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  agent_id: string;
  property_id: string;
  created_at: string;
}

export interface Contact {
  id: string;
  agent_id: string;
  property_id: string;
  owner_id: string;
  
  // Contact Information
  message?: string;
  contact_status: 'pending' | 'accepted' | 'rejected' | 'completed';
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface UserAuth {
  id: string;
  user_type: 'owner' | 'agent';
  owner_id?: string;
  agent_id?: string;
  created_at: string;
}

// Extended types with relationships
export interface PropertyWithOwner extends Property {
  owner: Owner;
}

export interface PropertyWithFavorites extends Property {
  is_favorite?: boolean;
  favorites_count?: number;
}

export interface AgentWithProfile extends Agent {
  user_auth: UserAuth;
}

export interface OwnerWithProfile extends Owner {
  user_auth: UserAuth;
}

// Form types for registration
export interface OwnerRegistrationData {
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

export interface AgentRegistrationData {
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  
  // Location Information
  country: string;
  state?: string;
  municipality?: string;
  neighborhood?: string;
  street?: string;
  postal_code?: string;
  
  // Professional Information
  experience_years?: number;
  properties_sold?: number;
  commission_percentage?: number;
  
  // Agency Information
  works_at_agency: boolean;
  agency_name?: string;
  
  // Description
  description?: string;
  
  // Subscription Information
  subscription_plan?: 'basic' | 'premium' | 'enterprise' | 'mensual' | 'semanal' | 'anual';
}

export interface PropertyCreationData {
  intent: 'venta' | 'renta';
  timeline?: string;
  price: number;
  property_type: string;
  documentation?: string;
  
  // Location Information
  country: string;
  state: string;
  municipality: string;
  neighborhood?: string;
  street?: string;
  postal_code?: string;
  
  // Property Characteristics
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number;
  construction_area?: number;
  land_area?: number;
  
  // Media and Description
  images?: string[];
  description?: string;
  
  // Commission
  commission_percentage: number;
}

// Database response types
export interface DatabaseResponse<T> {
  data: T | null;
  error: any;
}

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
} 
export interface Agent {
  id: string;
  user_id: string;
  
  // Personal Information
  full_name?: string;
  email?: string;
  phone?: string;
  
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
  subscription_plan?: 'basic' | 'premium' | 'enterprise';
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

export interface AgentFormData {
  // Personal Information
  full_name: string;
  email: string;
  phone: string;
  
  // Location Information
  country: string;
  state: string;
  municipality: string;
  neighborhood: string;
  street: string;
  postal_code: string;
  
  // Professional Information
  experience_years: string;
  properties_sold: string;
  commission_percentage: number;
  
  // Agency Information
  works_at_agency: boolean;
  agency_name: string;
  
  // Description
  description: string;
  
  // Subscription Information
  subscription_plan?: 'basic' | 'premium' | 'enterprise';
} 
export interface Property {
  id?: string;
  owner_id?: string;
  
  // Intent and Timeline
  intent: 'sell' | 'rent' | 'both';
  timeline: string;
  
  // Price
  price: number;
  
  // Property Type
  property_type: string;
  other_type?: string;
  
  // Documentation
  has_identification: boolean;
  has_tax_constancy: boolean;
  has_address_proof: boolean;
  has_deed: boolean;
  has_property_tax: boolean;
  has_water_bill: boolean;
  has_electricity_bill: boolean;
  has_folio_consultation: boolean;
  documentation_comments?: string;
  
  // Location Details
  country: string;
  state: string;
  municipality: string;
  neighborhood?: string;
  street: string;
  postal_code: string;
  
  // Property Characteristics
  land_area?: number;
  construction_area?: number;
  bedrooms?: number;
  bathrooms?: number;
  half_bathrooms?: number;
  amenities?: string;
  additional_info?: string;
  
  // Images
  images?: string[];
  
  // Commission
  commission_percentage: number;
  
  // View and Offer Tracking
  views_count?: number;
  offers_count?: number;
  
  // Status and Metadata
  status?: 'draft' | 'active' | 'published' | 'sold' | 'rented' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface PropertyFormData {
  // Intent and Timeline
  intent: 'sell' | 'rent' | 'both' | null;
  timeline: string | null;
  
  // Price
  price: string;
  
  // Property Type
  property_type: string | null;
  other_type: string;
  
  // Documentation
  documentation: {
    identification: boolean;
    tax_constancy: boolean;
    address_proof: boolean;
    deed: boolean;
    property_tax: boolean;
    water_bill: boolean;
    electricity_bill: boolean;
    folio_consultation: boolean;
  };
  documentation_comments: string;
  
  // Location Details
  country: string;
  state: string | null;
  municipality: string;
  neighborhood: string | null;
  street: string;
  postal_code: string;
  
  // Property Characteristics
  land_area: string;
  construction_area: string;
  bedrooms: string;
  bathrooms: string;
  half_bathrooms: string;
  amenities: string;
  additional_info: string;
  
  // Images
  images: string[];
  
  // Commission
  commission_percentage: string | null;
} 
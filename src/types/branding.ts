export interface BrandingSettings {
  name: string;
  branding: Branding;
  id?: string;               // Optional ID field         
  address?: string;          // Optional address
  createdAt?: string;        // Optional creation timestamp
  updatedAt?: string;        // Optional update timestamp
}

export interface Branding {
  logoUrl?: string | null;   // Optional logo URL, can be null
  tagline?: string;           // Tagline (required)
  hashTags?: string[] | null;    // Optional array of hashtags, can be null
}


export interface SchoolProfileResponse {
  code: number;              // Response code (200, 3025, etc.)
  message: string;           // Response message
  result: SchoolProfile;     // The actual school profile object
}

export interface SchoolProfile {
  id: string;                // School ID       // School name
  name: string;
  address?: string | null;   // Optional address, can be null
  professions?: string[];    // Optional array of professions
  branding: Branding;        // Branding details
  quota: Quota;              // Quota details
  createdAt: string;         // Creation timestamp
  updatedAt: string;         // Update timestamp
  userId: string;            // User ID associated with the school profile
  isDeleted: boolean;        // Flag for deletion status
}


export interface Quota {
  total: number;             // Total quota
  used: number;              // Used quota
}


export interface SchoolProfileRequest {
  name: string;               // Sent to backend as 'name' (maps to schoolName)
  branding: Branding;
}

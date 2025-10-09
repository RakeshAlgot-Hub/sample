import { create } from 'zustand';
import { createOrUpdateSchoolProfile, getBrandingSettings, updateBrandingSettings, uploadFile } from '../services/brandingService';
import { Branding, BrandingSettings, SchoolProfileRequest } from '../types/branding';

interface BrandingStore {
  settings: BrandingSettings | null;
  isLoading: boolean;
  error: string | null;

  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  uploadImage: (file: File) => Promise<void>;
  uploadStudentImage: (file: File) => Promise<{ code: number; result?: string; message?: string }>;
  updateSettings: (settings: Partial<BrandingSettings>) => void;
  addHashtag: (hashtag: string) => void;
  removeHashtag: (index: number) => void;
  submitSchoolProfile: () => Promise<void>;
  clearError: () => void;
}

export const useBrandingStore = create<BrandingStore>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await getBrandingSettings();
      if ((response.code === 200 || response.code === 3025) && response.result) {
        const schoolProfile = response.result;
        const branding: Branding = {
          tagline: schoolProfile.branding?.tagline || '',
          logoUrl: schoolProfile.branding?.logoUrl || null,
          hashTags: schoolProfile.branding?.hashTags || null,
        };
        const loadedSettings: BrandingSettings = {
          name: schoolProfile.name || '',
          branding,
          id: schoolProfile.id,
          address: schoolProfile.address || undefined,
          createdAt: schoolProfile.createdAt || undefined,
          updatedAt: schoolProfile.updatedAt || undefined,
        };
        set({ settings: loadedSettings, isLoading: false });
      } else {
        set({ error: response.message || 'Failed to load settings', isLoading: false });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load settings', isLoading: false });
    }
  },

  saveSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      const { settings } = get();
      if (!settings) throw new Error('No branding settings available');
      if (!settings.id) throw new Error('Branding settings id is missing');

      const updatePayload = {
        name: settings.name,
        branding: settings.branding,
        id: settings.id,
        address: settings.address,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      };

      const response = await updateBrandingSettings(settings.id, updatePayload);

      if (response.code === 200 && response.result) {
        set({ settings: response.result, isLoading: false });
      } else {
        set({ error: response.message || 'Failed to save settings', isLoading: false });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to save settings', isLoading: false });
    }
  },

  uploadImage: async (file: File) => {
  try {
    const response = await uploadFile<string>(file); // result is string

    if ((response.code === 200 || response.code === 3003) && response.result) {
      const logoUrl = response.result; // ✅ directly use string

      set(state => {
        const updatedBranding: Branding = {
          logoUrl: logoUrl || null,
          tagline: state.settings?.branding?.tagline ?? "",
          hashTags: state.settings?.branding?.hashTags || null,
        };

        const updatedSettings: BrandingSettings = {
          ...state.settings,
          name: state.settings?.name ?? "",
          branding: updatedBranding,
        };

        return { settings: updatedSettings };
      });
    } else {
      set({ error: response.message || 'Failed to upload logo' });
    }
  } catch (error) {
    set({ error: error instanceof Error ? error.message : 'Failed to upload logo' });
  }
},


  uploadStudentImage: async (file: File) => {
  const response = await uploadFile<string>(file); // result is string

  return {
    code: response.code,
    message: response.message,
    result: response.result ?? undefined, // ✅ no .logoUrl
  };
},


  updateSettings: (updates: Partial<BrandingSettings>) => {
    set(state => ({
      settings: state.settings ? { ...state.settings, ...updates } : { name: '', tagline: '', hashtags: [], ...updates } as BrandingSettings,
    }));
  },

  addHashtag: (hashtag: string) => {
    set(state => {
      const updatedHashtags = state.settings?.branding?.hashTags
        ? [...state.settings.branding.hashTags, `#${hashtag}`]
        : [`#${hashtag}`];
      return {
        settings: {
          ...state.settings,
          branding: {
            ...state.settings?.branding,
            hashTags: updatedHashtags,
          },
          name: state.settings?.name || '',
          tagline: state.settings?.branding.tagline || '',
          logoUrl: state.settings?.branding.logoUrl,
          address: state.settings?.address,
          createdAt: state.settings?.createdAt,
          updatedAt: state.settings?.updatedAt,
          id: state.settings?.id,
        }
      };
    });
  },

  removeHashtag: (index: number) => {
    set(state => {
      const updatedHashtags = (state.settings?.branding?.hashTags || []).filter((_, i) => i !== index);
      return {
        settings: {
          ...state.settings,
          branding: {
            ...state.settings?.branding,
            hashTags: updatedHashtags,
          },
          name: state.settings?.name || '',
          tagline: state.settings?.branding.tagline || '',
          logoUrl: state.settings?.branding.logoUrl,
          address: state.settings?.address,
          createdAt: state.settings?.createdAt,
          updatedAt: state.settings?.updatedAt,
          id: state.settings?.id,
        }
      };
    });
  },

  submitSchoolProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const { settings } = get();
      if (!settings) throw new Error('No branding settings available');

      const payload: SchoolProfileRequest = {
        name: settings.name,
        branding: {
          logoUrl: settings.branding.logoUrl,
          tagline: settings.branding.tagline,
        },
      };

      console.log('Submitting school profile payload:', payload);
      const response = await createOrUpdateSchoolProfile(payload);
      set({ isLoading: false });
      if (!(response.code === 200 || response.code === 3003)) {
        set({ error: response.message || 'Failed to submit school profile' });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to submit school profile',
      });
    }
  },

  clearError: () => set({ error: null }),
}));

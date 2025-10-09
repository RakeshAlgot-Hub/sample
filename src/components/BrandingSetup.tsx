import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Upload, ArrowRight, School } from 'lucide-react';
import { useBrandingStore } from '../stores/useBrandingStore';
import Footer from './Footer';
import { getLogoUrl } from '../utils/imageUtils';

const BrandingSetup: React.FC = () => {
  const navigate = useNavigate();
  const {
    settings,
    updateSettings,
    uploadImage,
    isLoading,
    loadSettings,
    submitSchoolProfile,
  } = useBrandingStore();

  // Local state for inputs, initialized only once after settings load
  const [schoolName, setSchoolName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // This ref tracks if initial load synced local state
  const [hasSyncedInitial, setHasSyncedInitial] = useState(false);

  // On mount, load backend settings once
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Only sync store settings to local inputs once on load
  useEffect(() => {
    if (settings && !hasSyncedInitial) {
      setSchoolName(settings.name || '');
      setTagline(settings.branding?.tagline || '');
      setHasSyncedInitial(true);
    }
  }, [settings, hasSyncedInitial]);

  // Cleanup logo preview URL when component unmounts or changes
  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  // Handle input changes immediately sync to store and local state
  const handleSchoolNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSchoolName(value);
    updateSettings({ name: value });
  };

  const handleTaglineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagline(value);
    updateSettings({
      branding: {
        ...settings?.branding,
        tagline: value,
      },
    });
  };

  // Handle logo file select and upload without resetting local inputs
  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingLogo(true);
      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setLogoPreviewUrl(previewUrl);
      try {
        await uploadImage(file);
      } catch (error) {
        console.error('Failed to upload logo:', error);
        // Revoke preview URL and clear
        URL.revokeObjectURL(previewUrl);
        setLogoPreviewUrl(null);
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  // On continue, submit form and navigate
  const handleContinue = async () => {
    await submitSchoolProfile();
    navigate('/teacher');
  };

  const handleSkip = () => {
    navigate('/teacher');
  };

  // Determine which logo to show: preview or saved URL
  const logoDisplayUrl = logoPreviewUrl || getLogoUrl(settings?.branding?.logoUrl ?? undefined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 pb-16">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-blue-600 rounded-full p-4 w-20 h-20 mx-auto mb-4">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Future Frame</h1>
          <p className="text-gray-600">Let's set up your school's branding</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div>
            <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-2">
              <School className="inline w-4 h-4 mr-1" />
              School Name
            </label>
            <input
              type="text"
              id="schoolName"
              value={schoolName}
              onChange={handleSchoolNameChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your school name"
            />
          </div>

          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-2">
              School Tagline
            </label>
            <input
              type="text"
              id="tagline"
              value={tagline}
              onChange={handleTaglineChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your school tagline"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="inline w-4 h-4 mr-1" />
              School Logo (Optional)
            </label>

            {(logoDisplayUrl) && (
              <div className="mb-4">
                <img
                  src={logoDisplayUrl}
                  alt="School logo"
                  className="w-24 h-24 object-contain border border-gray-200 rounded-lg mx-auto"
                />
              </div>
            )}

            {isUploadingLogo && (
              <div className="mb-4 text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-l-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Uploading logo...</p>
              </div>
            )}

            <div className="flex justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                className="hidden"
                id="logo-upload"
                disabled={isLoading || isUploadingLogo}
              />
              <label
                htmlFor="logo-upload"
                className={`flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition duration-200 ${
                  (isLoading || isUploadingLogo) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploadingLogo ? 'Uploading...' : (logoDisplayUrl) ? 'Change Logo' : 'Upload Logo'}
              </label>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 text-white">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Preview</h3>
            <div className="flex items-center">
              {logoDisplayUrl ? (
                <img
                  src={logoDisplayUrl}
                  alt="Logo"
                  className="w-10 h-10 object-contain bg-white/20 backdrop-blur-sm rounded-full p-2 mr-3"
                />
              ) : (
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 mr-3">
                  <School className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h4 className="font-bold">{schoolName || 'Your School Name'}</h4>
                <p className="text-sm opacity-90">{tagline}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition duration-200"
            >
              Skip for Now
            </button>
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-l-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default BrandingSetup;

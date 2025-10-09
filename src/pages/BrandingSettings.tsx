import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, School, MapPin, Hash, Upload, X, Plus, Save, AlertCircle, LogOut } from 'lucide-react';
import { useBrandingStore } from '../stores/useBrandingStore';
import { useAuthStore } from '../stores/useAuthStore';
import Footer from '../components/Footer';
import { getLogoUrl } from '../utils/imageUtils';

const BrandingSettings: React.FC = () => {
  const {
    settings,
    isLoading,
    error,
    loadSettings,
    saveSettings,
    uploadImage,
    updateSettings,
    addHashtag,
    removeHashtag,
    clearError
  } = useBrandingStore();

  const { logout } = useAuthStore();
  const [newHashtag, setNewHashtag] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const logoDisplayUrl = getLogoUrl(settings?.branding?.logoUrl ?? undefined);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSchoolNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ name: e.target.value });
    setHasUnsavedChanges(true);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateSettings({ address: e.target.value });
    setHasUnsavedChanges(true);
  };

  const handleAddHashtag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHashtag.trim()) {
      addHashtag(newHashtag.trim());
      setNewHashtag('');
      setHasUnsavedChanges(true);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
      setHasUnsavedChanges(false);
    }
  };

  const handleSave = async () => {
    await saveSettings();
    setHasUnsavedChanges(false);
  };

  const handleRemoveHashtag = (index: number) => {
    removeHashtag(index);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/teacher"
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg transition duration-200 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Back</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">School Branding</h1>
                <p className="text-sm text-gray-600">Customize your school's appearance</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg transition duration-200"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Processing...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Save Button */}
        {hasUnsavedChanges && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                <p className="text-yellow-700 text-sm">You have unsaved changes</p>
              </div>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition duration-200"
              >
                <Save className="w-4 h-4 mr-1" />
                Save Changes
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* School Name */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <School className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">School Name</h2>
            </div>
            <input
              type="text"
              value={settings?.name}
              onChange={handleSchoolNameChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter school name"
            />
          </div>

          {/* Logo Upload */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <Upload className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">School Logo</h2>
            </div>

            {settings?.branding?.logoUrl && (
              <div className="mb-4">
                <img
                  src={logoDisplayUrl}
                  alt="School logo"
                  className="w-32 h-32 object-contain border border-gray-200 rounded-lg"
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                {settings?.branding?.logoUrl ? 'Change Logo' : 'Upload Logo'}
              </label>
              {settings?.branding?.logoUrl && (
                <button
                  onClick={() => {
                    updateSettings({ branding: { ...settings.branding, logoUrl: '' } });
                    setHasUnsavedChanges(true);
                  }}
                  className="ml-3 px-4 py-2 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg transition duration-200"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">School Address</h2>
            </div>
            <textarea
              value={settings?.address}
              onChange={handleAddressChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter school address"
            />
          </div>

          {/* Hashtags */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <Hash className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Hashtags</h2>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {/* Ensure hashtags default to an empty array if undefined */}
              {(settings?.branding?.hashTags || []).map((hashtag, index) => (
                <div
                  key={index}
                  className={`flex items-center px-3 py-1 rounded-full text-sm ${hashtag === '#yensisolutions'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                    }`}
                >
                  <span>{hashtag}</span>
                  {hashtag !== '#yensisolutions' && (
                    <button
                      onClick={() => handleRemoveHashtag(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Hashtag */}
            <form onSubmit={handleAddHashtag} className="flex gap-2">
              <input
                type="text"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add hashtag (without #)"
              />
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </form>

          </div>

          {/* Preview */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
            <div className="bg-gray-900 rounded-lg p-6 text-white relative overflow-hidden">
              {/* Mock TV View Preview */}
              <div className="flex items-center mb-4">
                {settings?.branding?.logoUrl ? (
                  <img
                    src={logoDisplayUrl}
                    alt="Logo"
                    className="w-12 h-12 object-contain bg-white/20 backdrop-blur-sm rounded-full p-2 mr-3"
                  />
                ) : (
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-3">
                    <School className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold">{settings?.name}</h3>
                  <p className="text-sm opacity-90">Future Frame Program</p>
                </div>
              </div>

              {settings?.address && (
                <div className="text-sm opacity-75 mb-2">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {settings.address}
                </div>
              )}

              {settings?.branding?.hashTags && settings.branding.hashTags.length > 0 && (
                <div className="text-sm opacity-75">
                  {settings.branding.hashTags.join(' ')}
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BrandingSettings;
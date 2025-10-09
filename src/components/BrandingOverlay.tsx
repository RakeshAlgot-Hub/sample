import React from 'react';
import { School } from 'lucide-react';
import { useBrandingStore } from '../stores/useBrandingStore';

const BrandingOverlay: React.FC = () => {
  const { settings } = useBrandingStore();

  return (
    <>
      {/* Top Left Logo */}
      <div className="absolute top-8 left-8 z-10">
        <div className="flex items-center text-white drop-shadow-lg">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="School logo"
              className="w-16 h-16 object-contain bg-white/20 backdrop-blur-sm rounded-full p-2 mr-3"
            />
          ) : (
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-3">
              <School className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{settings?.schoolName}</h1>
            <p className="text-sm opacity-90">{settings?.tagline}</p>
            {settings?.address && (
              <p className="text-xs opacity-75">{settings?.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Tagline */}
      <div className="absolute bottom-8 right-8 z-10">
        <div className="text-right text-white drop-shadow-lg">
          <p className="text-xl font-medium opacity-90">
            Inspiring Tomorrow's Leaders
          </p>
          <p className="text-sm opacity-75">
            Future Frame Citizens
          </p>
          {settings?.hashtags?.length ? (
            <p className="text-xs opacity-60 mt-1">
              {settings.hashtags.join(' ')}
            </p>
          ) : null}
        </div>
      </div>

    </>
  );
};

export default BrandingOverlay;
import React from 'react';

interface VideoPlayerProps {
  futureImageUrl?: string;
  studentName?: string;
  studentClass?: string;
  profession?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  futureImageUrl,
  studentName,
  studentClass,
  profession,
}) => {
  if (!studentName && !studentClass && !profession) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white text-center">
        <div>
          <div className="w-16 h-16 border-4 border-white border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl opacity-75">Waiting for new session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>

      {/* Future Self Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        {futureImageUrl ? (
          <img
            src={futureImageUrl}
            alt="Future self"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-white">
            <div className="w-48 h-48 border-4 border-white border-dashed rounded-full flex items-center justify-center mx-auto mb-8">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-white border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm opacity-75">Generating Future Self</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
              {studentName}
            </h2>
            <p className="text-xl opacity-75 drop-shadow-md mb-2">
              {studentClass}
            </p>
            <p className="text-2xl opacity-90 drop-shadow-md">
              Future {profession}
            </p>
          </div>
        )}
      </div>

      {/* Student Info Overlay */}
      {futureImageUrl && (studentName || studentClass || profession) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
          <div className="text-white">
            {studentName && (
              <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
                {studentName}
              </h2>
            )}
            {studentClass && (
              <p className="text-xl opacity-75 drop-shadow-md mb-1">
                {studentClass}
              </p>
            )}
            {profession && (
              <p className="text-2xl opacity-90 drop-shadow-md">
                Future {profession}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
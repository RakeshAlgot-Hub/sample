import React from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import { useSessionStore } from '../stores/useSessionStore';

const UploadProgress: React.FC = () => {
  const { uploadProgress } = useSessionStore();

  if (!uploadProgress.isUploading && uploadProgress.percentage === 0) {
    return null;
  }

  const isComplete = uploadProgress.percentage >= 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        {isComplete ? (
          <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
        ) : (
          <Upload className="w-6 h-6 text-blue-500 mr-2" />
        )}
        <h3 className="text-lg font-semibold text-gray-800">
          {isComplete ? 'Upload Complete' : 'Uploading...'}
        </h3>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${uploadProgress.percentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>{Math.round(uploadProgress.percentage)}% complete</span>
        <span>
          {isComplete ? 'Ready for processing' : 'Please wait...'}
        </span>
      </div>
    </div>
  );
};

export default UploadProgress;
import React, { useState, useRef, useEffect } from 'react';
import { User, GraduationCap, Camera, Check, X } from 'lucide-react';
import { useSessionStore } from '../stores/useSessionStore';
import { useBrandingStore } from '../stores/useBrandingStore';
import { validateStudentName, validateStudentClass } from '../utils/validators';

const classes = [
  'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade',
  '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade',
  '10th Grade', '11th Grade', '12th Grade',
];

interface StartSessionFormProps {
  onSessionStart: () => void;
}

const StartSessionForm: React.FC<StartSessionFormProps> = ({ onSessionStart }) => {
  const [step, setStep] = useState<'form' | 'photo' | 'confirm'>('form');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<{ studentName?: string; studentClass?: string }>({});
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const setPendingSessionData = useSessionStore((state) => state.setPendingSessionData);
  const loadBrandingSettings = useBrandingStore((state) => state.loadSettings);
  const { uploadStudentImage } = useBrandingStore();

  useEffect(() => {
    loadBrandingSettings().catch(console.error);
  }, [loadBrandingSettings]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateStudentName(studentName);
    const classError = validateStudentClass(studentClass);

    if (nameError || classError) {
      setErrors({ studentName: nameError || undefined, studentClass: classError || undefined });
      return;
    }

    setErrors({});
    setStep('photo');
    setFacingMode('user');
    startCamera('user');
  };

  const startCamera = async (fm: 'user' | 'environment') => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: fm }, audio: false });
      streamRef.current = stream;
      setFacingMode(fm);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Cannot access camera. Please check your device or browser.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    // Remove srcObject when camera is stopped
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.save();
        // Mirror only for front camera
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        context.restore();

        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoDataUrl);
        setStep('confirm');
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setStep('photo');
    startCamera(facingMode); // Use last used camera
  };

  const handleConfirmPhoto = async () => {
    if (!capturedPhoto) return;

    setIsUploading(true);
    try {
      const blob = await (await fetch(capturedPhoto)).blob();
      const file = new File([blob], 'student-photo.jpg', { type: 'image/jpeg' });

      const uploadResponse = await uploadStudentImage(file);
      const studentImageId = uploadResponse.result;

      if (!studentImageId) throw new Error('Failed to upload student image');

      setPendingSessionData(studentName.trim(), studentClass, studentImageId);
      onSessionStart();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    stopCamera();
    setStep('form');
  };

  // --- Render ---
  if (step === 'form') return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div>
        <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
          <User className="inline w-4 h-4 mr-1" /> Student Name
        </label>
        <input
          type="text"
          id="studentName"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border text-lg ${errors.studentName ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter student name"
        />
        {errors.studentName && <p className="mt-1 text-sm text-red-600">{errors.studentName}</p>}
      </div>

      <div>
        <label htmlFor="studentClass" className="block text-sm font-medium text-gray-700 mb-2">
          <GraduationCap className="inline w-4 h-4 mr-1" /> Class/Grade
        </label>
        <select
          id="studentClass"
          value={studentClass}
          onChange={(e) => setStudentClass(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border text-lg ${errors.studentClass ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="">Select class/grade</option>
          {classes.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
        </select>
        {errors.studentClass && <p className="mt-1 text-sm text-red-600">{errors.studentClass}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center text-lg"
      >
        <Camera className="w-5 h-5 mr-2" /> Take Student Photo
      </button>
    </form>
  );

  if (step === 'photo') return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Take Student Photo</h3>
        <p className="text-sm text-gray-600">Position {studentName} in the camera frame</p>
      </div>

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-64 object-cover rounded-lg bg-gray-900 transition-transform duration-200 ${facingMode === 'user' ? 'scale-x-[-1]' : ''
            }`}
        />

        <canvas ref={canvasRef} className="hidden" />

        {/* Camera frame overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 border-2 border-white border-dashed rounded-full opacity-50"></div>
        </div>

        {/* Camera toggle button */}
        <button
          type="button"
          onClick={async () => {
            const newFacing = facingMode === 'user' ? 'environment' : 'user';
            stopCamera();
            setFacingMode(newFacing);
            startCamera(newFacing);
          }}
          className="absolute bottom-3 right-3 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-3">
        <button onClick={handleBack} className="flex-1 px-4 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg flex items-center justify-center">
          <X className="w-4 h-4 mr-2" /> Cancel
        </button>
        <button onClick={capturePhoto} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center">
          <Camera className="w-4 h-4 mr-2" /> Capture
        </button>
      </div>
    </div>
  );

  if (step === 'confirm') return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Student Photo</h3>
        <p className="text-sm text-gray-600">{studentName} - {studentClass}</p>
      </div>

      {capturedPhoto && <img src={capturedPhoto} alt="Captured student photo" className="w-full h-64 object-cover rounded-lg" />}

      <div className="flex gap-3">
        <button onClick={retakePhoto} disabled={isUploading} className="flex-1 px-4 py-3 border border-gray-300 disabled:opacity-50 text-gray-700 rounded-lg flex items-center justify-center">
          <Camera className="w-4 h-4 mr-2" /> Retake
        </button>
        <button onClick={handleConfirmPhoto} disabled={isUploading} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center">
          {isUploading ? <>
            <div className="w-4 h-4 border-2 border-white border-l-transparent rounded-full animate-spin mr-2"></div> Uploading...
          </> : <><Check className="w-4 h-4 mr-2" /> Confirm & Start</>}
        </button>
      </div>
    </div>
  );

  return null;
};

export default StartSessionForm;

import React, { useState } from 'react';
import { Camera, Video, RotateCcw, Loader2 } from 'lucide-react';
import { useSessionStore } from '../stores/useSessionStore';
import { useBrandingStore } from '../stores/useBrandingStore';
import { formatDuration } from '../utils/validators';
import { getLogoUrl } from '../utils/imageUtils';
import { generatedImageBaseUrl } from '../constants/appConstants';

const professions = [
  'Astronaut', 'Doctor', 'Pilot', 'Scientist', 'Engineer', 'Teacher',
  'Artist', 'Chef', 'Veterinarian', 'Firefighter', 'Police Officer',
  'Nurse', 'Architect', 'Lawyer', 'Musician', 'Athlete', 'Designer'
];

interface CapturePanelProps {
  onSessionComplete: () => void;
}

const CapturePanel: React.FC<CapturePanelProps> = ({ onSessionComplete }) => {
  const {
    currentSession,
    captureState,
    startRecording,
    pauseRecording,
    setProfession,
    pendingSessionData,
    startSession,
    stopRecording: stopRecordingFromStore,
    stopSession: stopSessionFromStore,
    uploadVideo
  } = useSessionStore();

  const { settings } = useBrandingStore();
  const [selectedProfession, setSelectedProfession] = useState('');
  const [recordingStep, setRecordingStep] = useState<'ready' | 'recording' | 'selecting' | 'confirmed' | 'generating'>('ready');
  const [isStoppingRecording, setIsStoppingRecording] = useState(false);
  const [stopError, setStopError] = useState<string | null>(null);
  const [showAIImage, setShowAIImage] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const handleProfessionSelect = (profession: string) => {
    setSelectedProfession(profession);
  };

  const handleConfirmProfession = async () => {
    if (!selectedProfession || !pendingSessionData) return;
    setProfession(selectedProfession);
    setRecordingStep('generating');
    try {
      await startSession(
        pendingSessionData.studentName,
        pendingSessionData.studentClass,
        selectedProfession,
        pendingSessionData.studentImageId
      );

      setTimeout(() => {
        setShowAIImage(true);
        setRecordingStep('confirmed');
      }, 1000);
    } catch (error) {
      console.error('Error confirming profession:', error);
      setRecordingStep('selecting');
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(newStream);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  const switchCamera = async () => {
    const wasRecording = captureState.isRecording;
    const wasPaused = !captureState.isRecording && captureState.recordingDuration > 0;

    if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
      mediaRecorder.stop();
      await new Promise(resolve => {
        if (mediaRecorder) {
          mediaRecorder.onstop = () => resolve(undefined);
        }
      });
      setMediaRecorder(null);
      setRecordedChunks([]);
      stopRecordingFromStore();
    }

    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    if (wasRecording || wasPaused) {
      setRecordingStep('ready');
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  React.useEffect(() => {
    const videoElement = document.getElementById('live-camera') as HTMLVideoElement;
    if (videoElement && stream) {
      videoElement.srcObject = stream;
      videoElement.play().catch(console.error);
    }
  }, [stream]);

  const handleStopSession = () => {
    if (captureState.isRecording) {
      stopRecordingFromStore();
    }
    onSessionComplete();
  };

  const handleRecordingControl = () => {
    if (recordingStep === 'ready') {
      if (stream) {
        setRecordedChunks([]);
        try {
          const recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp8'
          });
          recorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              setRecordedChunks(prev => [...prev, event.data]);
            }
          };
          setMediaRecorder(recorder);
          recorder.start(1000);
        } catch (err) {
          console.error('Failed to start MediaRecorder:', err);
        }
      }
      startRecording();
      setRecordingStep('recording');
      setTimeout(() => {
        setRecordingStep('selecting');
      }, 1000);
    } else if (captureState.isRecording) {
      pauseRecording();
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
      }
    } else if (!captureState.isRecording && mediaRecorder && mediaRecorder.state === 'paused') {
      startRecording();
      mediaRecorder.resume();
    }
  };

  const handleStopRecording = async () => {
    if (captureState.isRecording) {
      pauseRecording();
    }
    stopRecordingFromStore();

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      await new Promise(resolve => {
        if (mediaRecorder) {
          mediaRecorder.onstop = () => resolve(undefined);
        }
      });
    }

    setIsStoppingRecording(true);
    setStopError(null);

    try {
      if (recordedChunks.length > 0) {
        const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
        const videoUrl = await uploadVideo(videoBlob);

        if (videoUrl) {
          console.log('✅ Video uploaded successfully:', videoUrl);
        } else {
          console.warn('⚠️ Video upload returned null');
        }
      }
      await stopSessionFromStore();
      handleStopSession();
    } catch (error) {
      setStopError(error instanceof Error ? error.message : 'An unexpected error occurred');
      console.error('Error stopping session:', error);
    } finally {
      setIsStoppingRecording(false);
    }
  };

  const getRecordingButtonText = () => {
    if (recordingStep === 'ready') {
      return 'Start Recording';
    } else if (captureState.isRecording) {
      return 'Pause Recording';
    } else {
      return 'Recording Paused';
    }
  };

  const getRecordingButtonColor = () => {
    if (recordingStep === 'ready') {
      return 'bg-red-600 hover:bg-red-700';
    } else if (captureState.isRecording) {
      return 'bg-orange-600 hover:bg-orange-700';
    } else {
      return 'bg-gray-500 cursor-not-allowed';
    }
  };

  const logoDisplayUrl = getLogoUrl(settings?.branding?.logoUrl ?? undefined);

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Instagram Reels Style Split View */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden relative mb-3 min-h-0">
        {/* Recording Controls */}
        {recordingStep === 'confirmed' && (
          <div className="absolute top-2 left-2 right-2 z-30 space-y-2">
            {captureState.isRecording && (
              <button
                onClick={handleRecordingControl}
                disabled={isStoppingRecording}
                className={`w-full flex items-center justify-center py-3 px-6 text-white font-semibold rounded-lg transition duration-200 ${getRecordingButtonColor()} shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Video className="w-5 h-5 mr-2" />
                {getRecordingButtonText()}
              </button>
            )}
            {!captureState.isRecording && captureState.recordingDuration > 0 && (
              <button
                onClick={handleStopRecording}
                disabled={isStoppingRecording}
                className="w-full flex items-center justify-center py-3 px-6 text-white font-semibold rounded-lg transition duration-200 bg-green-600 hover:bg-green-700 shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStoppingRecording ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Stop Recording'
                )}
              </button>
            )}
            {stopError && (
              <div className="w-full p-3 bg-red-500/90 text-white text-sm rounded-lg shadow-lg backdrop-blur-sm">
                {stopError}
              </div>
            )}
          </div>
        )}

        {/* Top Half - AI Future Image */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-br from-purple-900 to-blue-900">
          <div className="absolute top-2 left-2 right-2 z-10">
            <div className="flex items-center text-white">
              {settings?.branding.logoUrl ? (
                <img
                  src={logoDisplayUrl}
                  alt="School logo"
                  className="w-6 h-6 object-contain bg-white/20 backdrop-blur-sm rounded-full p-1 mr-2"
                />
              ) : (
                <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full p-1 mr-2"></div>
              )}
              <span className="text-sm font-medium">{settings?.name}</span>
            </div>
          </div>

          {/* AI Generated Future Image */}
          {showAIImage ? (
            <div className="relative w-full h-full">
              <img
                src={`${generatedImageBaseUrl}${currentSession?.futureImageId || currentSession?.studentImageId || pendingSessionData?.studentImageId}`}
                alt="Future self"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn_YEVIqED0OrC_kAJyXnjudm0LyDbttrFDSYTHOOF1U5EoxtH5gyjseSUroYkQYOjJaI&usqp=CAU';
                }}
              />
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <h4 className="text-lg font-bold drop-shadow-lg mb-1">
                  {currentSession?.studentName || pendingSessionData?.studentName}
                </h4>
                <p className="text-sm opacity-90 drop-shadow-md">
                  Future {selectedProfession}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-center h-full">
              <div className="text-center text-white">
                {recordingStep === 'ready' && (
                  <>
                    <button
                      onClick={handleRecordingControl}
                      className="mb-6 flex items-center justify-center py-3 px-6 text-white font-semibold rounded-full transition duration-200 bg-red-600 hover:bg-red-700 shadow-lg backdrop-blur-sm"
                    >
                      <Video className="w-5 h-5 mr-2" />
                      Start Recording
                    </button>
                    <p className="text-sm opacity-75">Press to start recording</p>
                  </>
                )}
                {recordingStep === 'recording' && (
                  <>
                    <button
                      onClick={handleRecordingControl}
                      className="mb-6 flex items-center justify-center py-3 px-6 text-white font-semibold rounded-full transition duration-200 bg-orange-600 hover:bg-orange-700 shadow-lg backdrop-blur-sm"
                    >
                      <Video className="w-5 h-5 mr-2" />
                      Pause Recording
                    </button>
                    <div className="animate-pulse">
                      <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2"></div>
                      <p className="text-sm opacity-75">Recording in progress...</p>
                    </div>
                  </>
                )}
                {recordingStep === 'selecting' && (
                  <>
                    <div className="mb-4 w-full max-w-xs">
                      <select
                        value={selectedProfession}
                        onChange={(e) => handleProfessionSelect(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm mb-3"
                      >
                        <option value="" className="text-gray-900">Choose profession...</option>
                        {professions.map((profession) => (
                          <option key={profession} value={profession} className="text-gray-900">
                            {profession}
                          </option>
                        ))}
                      </select>
                      {selectedProfession && (
                        <button
                          onClick={handleConfirmProfession}
                          className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200"
                        >
                          Confirm Profession
                        </button>
                      )}
                    </div>
                    <p className="text-sm opacity-75">Select future profession</p>
                  </>
                )}
                {recordingStep === 'generating' && (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm opacity-75">Generating your future...</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Half - Live Camera */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gray-900">
          <div className="relative w-full h-full">
            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-75">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                  >
                    Retry Camera
                  </button>
                </div>
              </div>
            ) : (
              <>
                <video
                  id="live-camera"
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
                {/* Camera Switch Button */}
                <button
                  onClick={switchCamera}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          {captureState.isRecording && (
            <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded-full">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                <span className="text-white text-xs font-mono">
                  {formatDuration(captureState.recordingDuration)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 space-y-3">
        {captureState.isRecording && (
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded-full text-sm">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
              REC {formatDuration(captureState.recordingDuration)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapturePanel;
import { create } from 'zustand';
import { createSession, getSessionStatus, getSessionOutputs, startFinalVideo, getAllSessions } from '../services/sessionService';
import { createJob, getJobStatus } from '../services/jobService';
import { Session, CaptureState, UploadProgress } from '../types';
import { useBrandingStore } from './useBrandingStore';
import { uploadFile } from '../services/brandingService';
import { backendFormatToDate } from '../utils/dateUtils';

interface SessionStore {
  currentSession: Session | null;
  captureState: CaptureState;
  uploadProgress: UploadProgress;
  studentImageId?: string;
  pendingSessionData: {
    studentName: string;
    studentClass: string;
    studentImageId: string;
  } | null;
  currentJobId: string | null;

  allSessions: Session[];
  latestSession: Session | null;
  isLoadingSessions: boolean;
  sessionsError: string | null;

  createSessionWithProfession: (
    studentName: string,
    studentClass: string,
    profession: string,
    studentImageId: string
  ) => Promise<void>;
  stopSession: () => Promise<void>;
  uploadVideo: (videoBlob: Blob) => Promise<string | null>;

  setPendingSessionData: (studentName: string, studentClass: string, studentImageId: string) => void;
  setStudentImage: (imageId: string) => void;

  takePhoto: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  setProfession: (profession: string) => void;
  setStatus: (status: Session['status']) => void;
  setUploadProgress: (progress: number) => void;
  setOutputs: (futureImageUrl?: string, finalVideoUrl?: string) => void;
  resetSession: () => void;
  pollSessionStatus: (sessionId: string) => Promise<void>;

  loadAllSessions: (schoolId: string) => Promise<void>;
}

let recordingInterval: ReturnType<typeof setInterval> | null = null;
let recordingStartTime = 0;
let elapsedTimeBeforePause = 0;

export const useSessionStore = create<SessionStore>((set, get) => ({
  currentSession: null,
  captureState: { isRecording: false, hasPhoto: false, recordingDuration: 0 },
  uploadProgress: { percentage: 0, isUploading: false },
  pendingSessionData: null,
  currentJobId: null,

  allSessions: [],
  latestSession: null,
  isLoadingSessions: false,
  sessionsError: null,

  createSessionWithProfession: async (studentName, studentClass, profession, studentImageId) => {
    try {
      const schoolId = useBrandingStore.getState().settings?.id;
      if (!schoolId) {
        console.error('School ID is missing from branding settings');
        return;
      }

      const sessionResponse = await createSession(studentName, studentClass, schoolId);
      if ((sessionResponse.code === 200 || sessionResponse.code === 3034) && sessionResponse.result) {
        const session = sessionResponse.result;
        set({
          currentSession: {
            ...session,
            profession,
            studentImageId
          },
        });

        const jobResponse = await createJob(session.id, studentImageId, profession);
        if ((jobResponse.code === 3057 || jobResponse.code === 200) && jobResponse.result) {
          set({ currentJobId: jobResponse.result.id });
          get().pollJobStatus(jobResponse.result.id);
        } else {
          console.error('Failed to create job:', jobResponse.message);
        }
      } else {
        console.error('Failed to create session:', sessionResponse.message);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  },

  uploadVideo: async (videoBlob: Blob) => {
    try {
      const videoFile = new File([videoBlob], 'recording.mp4', { type: 'video/mp4' });
      const response = await uploadFile(videoFile);
      console.log("response", response)

      if (response.code === 3003 && response.result) {
        const videoUrl = response.result;

        const { currentSession } = get();
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              videoId: videoUrl
            }
          });
        }

        return videoUrl;
      } else {
        console.error('Failed to upload video:', response.message);
        return null;
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      return null;
    }
  },

  stopSession: async () => {
    const { currentSession } = get();
    if (!currentSession) return;

    try {
      set({
        currentSession: { ...currentSession, status: 'uploading' },
        uploadProgress: { percentage: 0, isUploading: true },
      });

      const uploadInterval = setInterval(() => {
        const { uploadProgress } = get();
        if (uploadProgress.percentage < 90) {
          set({
            uploadProgress: {
              ...uploadProgress,
              percentage: uploadProgress.percentage + 10,
            },
          });
        }
      }, 200);

      const branding = useBrandingStore.getState().settings;
      if (!branding) {
        console.error('❌ Branding settings not found');
        clearInterval(uploadInterval);
        set({ uploadProgress: { percentage: 0, isUploading: false } });
        return;
      }

      const futureImageUrl = currentSession.futureImageId || currentSession.studentImageId
      const teacherVideoUrl = currentSession.videoId || '';

      const finalVideoResponse = await startFinalVideo(
        currentSession.id,
        currentSession.schoolId,
        teacherVideoUrl,
        futureImageUrl,
        branding.branding.logoUrl || '',
        branding.branding.tagline || ''
      );

      clearInterval(uploadInterval);

      if (finalVideoResponse.code === 3078 || finalVideoResponse.code === 200) {
        set({
          uploadProgress: { percentage: 100, isUploading: false },
        });

        const statusResponse = await getSessionStatus(currentSession.id);
        if (statusResponse?.result) {
          const result = statusResponse.result as Partial<Session>;
          set({
            currentSession: {
              ...get().currentSession!,
              ...result,
              createdAt: typeof result.createdAt === 'string'
                ? backendFormatToDate(result.createdAt)
                : (result.createdAt ?? get().currentSession!.createdAt),
            },
          });
        }

   
        get().pollSessionStatus(currentSession.id);
      } else {
        console.error('Failed to start final video generation:', finalVideoResponse.message);
        set({ uploadProgress: { percentage: 0, isUploading: false } });
      }
    } catch (error) {
      console.error('Error stopping session:', error);
      set({ uploadProgress: { percentage: 0, isUploading: false } });
    }
  },

  pollJobStatus: async (jobId: string) => {
    try {
      const response = await getJobStatus(jobId);
      if (!response?.result) return;

      const { currentSession } = get();
      if (!currentSession) return;

      const job = response.result;

      if (job.status === 'success') {
        set({
          currentSession: {
            ...currentSession,
            futureImageId: job.imageUrl,
            status: 'ready'
          },
        });
      } else if (job.status === 'failed') {
        set({
          currentSession: {
            ...currentSession,
            status: 'idle'
          },
        });
      } else if (['processing', 'queued'].includes(job.status)) {
        setTimeout(() => get().pollJobStatus(jobId), 3000);
      }
    } catch (error) {
      console.error('⚠️ Error polling job status:', error);
    }
  },

  pollSessionStatus: async (sessionId) => {
    try {
      const response = await getSessionStatus(sessionId);
      if (!response?.result) return;

      const { currentSession } = get();
      if (!currentSession) return;

      const result = response.result as Partial<Session>;
      set({
        currentSession: {
          ...currentSession,
          ...result,
          createdAt: typeof result.createdAt === 'string'
            ? backendFormatToDate(result.createdAt)
            : (result.createdAt ?? currentSession.createdAt),
        },
      });

      if (result.status === 'ready') {
        const outputs = await getSessionOutputs(sessionId);
        if (outputs.code === 200 && outputs.result) {
          set({
            currentSession: {
              ...get().currentSession!,
              futureImageId: outputs.result.futureImageUrl,
              finalVideoUrl: outputs.result.finalVideoUrl,
            },
          });
        }
      } else if (['processing', 'queued', 'active'].includes(result.status!)) {
        setTimeout(() => get().pollSessionStatus(sessionId), 3000);
      }
    } catch (error) {
      console.error('⚠️ Error polling session status:', error);
    }
  },


  setPendingSessionData: (studentName, studentClass, studentImageId) => {
    set({ pendingSessionData: { studentName, studentClass, studentImageId } });
  },

  setStudentImage: (imageId) => {
    const { currentSession } = get();
    if (currentSession) set({ currentSession: { ...currentSession, studentImageId: imageId } });
  },

  takePhoto: () => {
    set({ captureState: { ...get().captureState, hasPhoto: true } });
  },

  startRecording: () => {
    recordingStartTime = Date.now();
    elapsedTimeBeforePause = 0;
    set({
      captureState: { ...get().captureState, isRecording: true, recordingDuration: 0 },
    });

    recordingInterval = setInterval(() => {
      const { captureState } = get();
      if (captureState.isRecording) {
        const currentElapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        set({
          captureState: {
            ...captureState,
            recordingDuration: elapsedTimeBeforePause + currentElapsed,
          },
        });
      }
    }, 1000);
  },

  pauseRecording: () => {
    if (recordingInterval) clearInterval(recordingInterval);
    const currentElapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    elapsedTimeBeforePause += currentElapsed;
    set({ captureState: { ...get().captureState, isRecording: false } });
  },

  stopRecording: () => {
    if (recordingInterval) clearInterval(recordingInterval);
    const currentElapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    elapsedTimeBeforePause += currentElapsed;
    set({
      captureState: {
        ...get().captureState,
        isRecording: false,
        recordingDuration: elapsedTimeBeforePause,
      },
    });
  },

  setProfession: (profession) => {
    const { currentSession } = get();
    if (currentSession) set({ currentSession: { ...currentSession, profession } });
  },

  setStatus: (status) => {
    const { currentSession } = get();
    if (currentSession) set({ currentSession: { ...currentSession, status } });
  },

  setUploadProgress: (percentage) => set({ uploadProgress: { ...get().uploadProgress, percentage } }),

  setOutputs: (futureImageId, finalVideoUrl) => {
    const { currentSession } = get();
    if (currentSession) set({ currentSession: { ...currentSession, futureImageId, finalVideoUrl } });
  },

  resetSession: () => {
    if (recordingInterval) clearInterval(recordingInterval);
    recordingStartTime = 0;
    elapsedTimeBeforePause = 0;
    set({
      currentSession: null,
      captureState: { isRecording: false, hasPhoto: false, recordingDuration: 0 },
      uploadProgress: { percentage: 0, isUploading: false },
      pendingSessionData: null,
      currentJobId: null,
    });
  },

  loadAllSessions: async (schoolId: string) => {
    try {
      set({ isLoadingSessions: true, sessionsError: null });

      const response = await getAllSessions(schoolId);

      if (!response || !response.result) {
        set({
          sessionsError: response?.message || "No session data received",
          isLoadingSessions: false,
        });
        return;
      }

      let sessions: Session[] = [];

      // ✅ Case 1: API returns array of sessions
      if (Array.isArray(response.result)) {
        sessions = response.result;
      }

      // ✅ Case 2: API returns { latest: {...} }
      else if (
        typeof response.result === "object" &&
        response.result !== null &&
        "latest" in response.result
      ) {
        sessions = [(response.result as { latest: Session }).latest];
      }

      // ✅ Case 3: Single session object directly
      else if (
        typeof response.result === "object" &&
        response.result !== null &&
        "id" in response.result
      ) {
        sessions = [response.result];
      }

      // ✅ Normalize session data
      const formattedSessions: Session[] = sessions.map((session: any) => ({
        id: session.id,
        studentName: session.studentName,
        studentClass: session.studentClass,
        profession: session.profession,
        schoolId: session.schoolId,
        studentImageId: session.studentImageId,
        futureImageId: session.futureImageId,
        videoId: session.videoId,
        outputs: session.outputs || {},
        instagramUrl: session.instagramUrl,
        status: session.status as Session['status'],
        createdAt: typeof session.createdAt === "string"
          ? backendFormatToDate(session.createdAt) 
          : session.createdAt, 
      }));
      set({
        allSessions: formattedSessions,
        latestSession: formattedSessions[0] || null,
        isLoadingSessions: false,
      });
    } catch (error) {
      console.error("Error loading sessions:", error);
      set({
        sessionsError:
          error instanceof Error ? error.message : "Failed to load sessions",
        isLoadingSessions: false,
      });
    }
  },
}));

export type SessionStatus =
  | "idle"
  | "capturing"
  | "uploading"
  | "queued"
  | "processing"
  | "ready"
  | "published";

// Base session info
export interface SessionBase {
  studentName: string;
  studentClass: string;
  schoolId: string;
}

// Session creation request
export interface SessionCreate extends SessionBase {}

// Session object returned from backend
export interface Session extends SessionBase {
  id: string;
  createdAt: Date;
  status: SessionStatus;
  profession?: string;
  studentImageId?: string;
  futureImageId?: string;
  videoId?: string;
  outputs?: Record<string, any>;
  instagramUrl?: string;
  finalVideoUrl?: string;
}

// Session update payload
export interface SessionUpdate {
  status?: SessionStatus;
  futureImageId?: string;
  videoId?: string;
  outputs?: Record<string, any>;
  instagramUrl?: string;
}

// Extra UI models
export interface CaptureState {
  isRecording: boolean;
  hasPhoto: boolean;
  recordingDuration: number; // seconds
}

export interface UploadProgress {
  percentage: number; // 0-100
  isUploading: boolean;
}

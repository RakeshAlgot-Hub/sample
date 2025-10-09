export interface TVState {
  latestFutureImageUrl?: string;
  studentName?: string;
  studentClass?: string;
  profession?: string;
  status: 'idle' | 'playing' | 'waiting';
}
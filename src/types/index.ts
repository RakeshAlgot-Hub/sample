import type { ReactNode } from "react";
import { User } from "./auth";
export * from './session'; // ✅ Use session.ts as the source of truth

export interface LoginTheme {
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  buttonStyle?: React.CSSProperties;
}

export interface LoginProps {
  backendUrl?: string;
  onSuccess?: (user: User) => void;
  googleLogintheme?: LoginTheme;
  customLayout?: ReactNode;
  className?: string;
  children?: ReactNode; 
}

export interface TVState {
  latestFutureImageUrl?: string;
  studentName?: string;
  studentClass?: string;
  profession?: string;
  status: 'idle' | 'playing' | 'waiting';
}

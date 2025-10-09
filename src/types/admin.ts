export interface SubscribedUser {
  id: string;
  username: string;
  email: string;
  createdDate: string;
  keycloakId: string;
  role?: string;
  userId?: string;
  endpoint?: string;
  subscribed?: boolean;
  createdAt?: string;
}

export interface AllUser {
  id: string;
  username: string;
  email: string;
  createdDate: string;
  keycloakId: string;
  role?: string;
  isEmailVerified?: boolean;
  profilePicture?: string | null;
  provider?: string;
}

export interface NotificationResponse {
  code: number;
  message: string;
}

export interface EmailRequest {
  email: string;
  subject: string;
  message: string;
  templateName: string;
  isHtml: boolean;
}

export interface SendNotificationRequest {
  recipientId?: string;
  message: string;
}

export type AdminTabType = 'sendEmail' | 'pushNotification';
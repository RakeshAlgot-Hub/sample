import { fontFamilies } from './fonts';

export const lightTheme = {
  primary: '#075E54',
  secondary: '#F0F2F5',
  accent: '#25D366',
  background: '#ECE5DD',
  text: '#111B21',
  textSecondary: '#667781',
  border: '#E9EDEF',
  card: '#FFFFFF',
  cardBorder: '#E9EDEF',
  inputBackground: '#FFFFFF',
  inputBorder: '#D1D7DB',
  success: '#25D366',
  error: '#EA0038',
  warning: '#FFA200',
  fonts: fontFamilies,
};

export const darkTheme = {
  primary: '#25D366',
  secondary: '#111B21',
  accent: '#00A884',
  background: '#0B141A',
  text: '#E9EDEF',
  textSecondary: '#8696A0',
  border: '#1F2C34',
  card: '#111B21',
  cardBorder: '#1F2C34',
  inputBackground: '#1F2C34',
  inputBorder: '#2A3942',
  success: '#25D366',
  error: '#EA0038',
  warning: '#FFA200',
  fonts: fontFamilies,
};

export type Theme = typeof lightTheme;

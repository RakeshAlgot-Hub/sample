export const LightColors = {
  primary: '#075E54',
  primaryLight: '#128C7E',
  primaryDark: '#054940',

  secondary: '#25D366',

  success: '#25D366',
  successLight: '#E8F5E3',

  warning: '#FFA726',
  warningLight: '#FFF3E0',

  danger: '#EF5350',
  dangerLight: '#FFEBEE',

  info: '#42A5F5',
  infoLight: '#E3F2FD',

  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  text: {
    primary: '#212121',
    secondary: '#666666',
    disabled: '#9E9E9E',
    hint: '#BDBDBD',
  },

  background: {
    default: '#F5F5F5',
    paper: '#FFFFFF',
    elevated: '#FAFAFA',
  },

  border: {
    light: '#F0F0F0',
    medium: '#E0E0E0',
    dark: '#BDBDBD',
  },
};

export const DarkColors = {
  primary: '#128C7E',
  primaryLight: '#25D366',
  primaryDark: '#054940',

  secondary: '#25D366',

  success: '#4CAF50',
  successLight: '#1B5E20',

  warning: '#FF9800',
  warningLight: '#E65100',

  danger: '#F44336',
  dangerLight: '#B71C1C',

  info: '#2196F3',
  infoLight: '#0D47A1',

  neutral: {
    50: '#1E1E1E',
    100: '#2C2C2C',
    200: '#383838',
    300: '#4A4A4A',
    400: '#6B6B6B',
    500: '#8E8E8E',
    600: '#B0B0B0',
    700: '#CFCFCF',
    800: '#E0E0E0',
    900: '#F5F5F5',
  },

  text: {
    primary: '#F5F5F5',
    secondary: '#B0B0B0',
    disabled: '#6B6B6B',
    hint: '#8E8E8E',
  },

  background: {
    default: '#121212',
    paper: '#1E1E1E',
    elevated: '#2C2C2C',
  },

  border: {
    light: '#2C2C2C',
    medium: '#383838',
    dark: '#4A4A4A',
  },
};

export const Fonts = {
  family: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  size: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};

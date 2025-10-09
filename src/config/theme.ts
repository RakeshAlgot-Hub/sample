export interface ThemeConfig {
  projectName: string;
  description: string;
  colors: {
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    secondary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    accent: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
    rainbow: string;
  };
}

// Default theme configuration - can be overridden by environment variables
export const defaultTheme: ThemeConfig = {
  projectName: import.meta.env.VITE_PROJECT_NAME || 'Dynamic App',
  description: import.meta.env.VITE_PROJECT_DESCRIPTION || 'A dynamic application template',
  colors: {
    primary: {
      50: import.meta.env.VITE_PRIMARY_50 || '#f0f9ff',
      100: import.meta.env.VITE_PRIMARY_100 || '#e0f2fe',
      200: import.meta.env.VITE_PRIMARY_200 || '#bae6fd',
      300: import.meta.env.VITE_PRIMARY_300 || '#7dd3fc',
      400: import.meta.env.VITE_PRIMARY_400 || '#38bdf8',
      500: import.meta.env.VITE_PRIMARY_500 || '#0ea5e9',
      600: import.meta.env.VITE_PRIMARY_600 || '#0284c7',
      700: import.meta.env.VITE_PRIMARY_700 || '#0369a1',
      800: import.meta.env.VITE_PRIMARY_800 || '#075985',
      900: import.meta.env.VITE_PRIMARY_900 || '#0c4a6e',
    },
    secondary: {
      50: import.meta.env.VITE_SECONDARY_50 || '#f0fdf4',
      100: import.meta.env.VITE_SECONDARY_100 || '#dcfce7',
      200: import.meta.env.VITE_SECONDARY_200 || '#bbf7d0',
      300: import.meta.env.VITE_SECONDARY_300 || '#86efac',
      400: import.meta.env.VITE_SECONDARY_400 || '#4ade80',
      500: import.meta.env.VITE_SECONDARY_500 || '#22c55e',
      600: import.meta.env.VITE_SECONDARY_600 || '#16a34a',
      700: import.meta.env.VITE_SECONDARY_700 || '#15803d',
      800: import.meta.env.VITE_SECONDARY_800 || '#166534',
      900: import.meta.env.VITE_SECONDARY_900 || '#14532d',
    },
    accent: {
      50: import.meta.env.VITE_ACCENT_50 || '#fffbeb',
      100: import.meta.env.VITE_ACCENT_100 || '#fef3c7',
      200: import.meta.env.VITE_ACCENT_200 || '#fde68a',
      300: import.meta.env.VITE_ACCENT_300 || '#fcd34d',
      400: import.meta.env.VITE_ACCENT_400 || '#fbbf24',
      500: import.meta.env.VITE_ACCENT_500 || '#f59e0b',
      600: import.meta.env.VITE_ACCENT_600 || '#d97706',
      700: import.meta.env.VITE_ACCENT_700 || '#b45309',
      800: import.meta.env.VITE_ACCENT_800 || '#92400e',
      900: import.meta.env.VITE_ACCENT_900 || '#78350f',
    },
  },
  gradients: {
    primary: import.meta.env.VITE_GRADIENT_PRIMARY || 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    secondary: import.meta.env.VITE_GRADIENT_SECONDARY || 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    accent: import.meta.env.VITE_GRADIENT_ACCENT || 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    rainbow: import.meta.env.VITE_GRADIENT_RAINBOW || 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
  },
};


// Hook to get current theme
export const useTheme = () => {
  return defaultTheme;
};
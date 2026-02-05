import { useStore } from '@/store/useStore';
import { lightTheme, darkTheme, Theme } from './colors';

export const useTheme = (): Theme => {
  const themeMode = useStore((state) => state.themeMode);
  return themeMode === 'light' ? lightTheme : darkTheme;
};

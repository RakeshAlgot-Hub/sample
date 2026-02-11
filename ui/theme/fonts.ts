import { Platform } from 'react-native';

export const fontFamilies = {
  regular: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }) || 'System',
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }) || 'System',
  bold: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }) || 'System',
};

export type Fonts = typeof fontFamilies;

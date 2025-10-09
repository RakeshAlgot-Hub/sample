import { useTheme } from '../config/theme';

export const useProjectConfig = () => {
  const theme = useTheme();
  
  const projectName = import.meta.env.VITE_PROJECT_NAME || 'Dynamic App';
  const projectDescription = import.meta.env.VITE_PROJECT_DESCRIPTION || 'A dynamic application template';
  const companyName = 'Yensi Solutions'; // Fixed company name
  const companyLogo = '/images/yensi-logo.png'; // Fixed logo path
  
  return {
    projectName,
    projectDescription,
    companyName,
    companyLogo,
    theme,
  };
};
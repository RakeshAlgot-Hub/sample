import { imageBaseUrl } from "../constants/appConstants";

// Utility function to get the full logo URL
export const getLogoUrl = (logoFileName: string | undefined): string | undefined => {
  if (!logoFileName) return undefined;
  
  // Assuming imageBaseUrl is a constant that holds the base URL for your images
  return `${imageBaseUrl}${logoFileName}`;
};

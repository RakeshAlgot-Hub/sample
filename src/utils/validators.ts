export const validateStudentName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Student name is required';
  }
  if (name.trim().length < 2) {
    return 'Student name must be at least 2 characters';
  }
  if (name.trim().length > 50) {
    return 'Student name must be less than 50 characters';
  }
  return null;
};

export const validateStudentClass = (studentClass: string): string | null => {
  if (!studentClass.trim()) {
    return 'Class/Grade is required';
  }
  return null;
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
import { User } from '@/store/useStore';

export const mockUsers: Record<string, User & { password: string }> = {
  'demo@propertypal.com': {
    id: '1',
    name: 'Demo User',
    email: 'demo@propertypal.com',
    password: 'demo123',
  },
  'john@example.com': {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password',
  },
};

export const validateCredentials = (
  email: string,
  password: string
): User | null => {
  const user = mockUsers[email.toLowerCase()];
  if (user && user.password === password) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

export const createMockUser = (
  name: string,
  email: string,
  password: string
): User => {
  return {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
  };
};

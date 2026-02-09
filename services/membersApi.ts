import { requestJson } from './apiClient';
import { Member } from '@/types/member';

export type CreateMemberInput = Omit<Member, 'id' | 'createdAt'> & {
    createdAt?: string;
};

export const membersApi = {
    getAll: () => requestJson<Member[]>('/members', 'GET'),
    create: (payload: CreateMemberInput) => requestJson<Member>('/members', 'POST', payload),
    update: (id: string, updates: Partial<Member>) =>
        requestJson<Member>(`/members/${id}`, 'PATCH', updates),
    remove: (id: string) => requestJson<void>(`/members/${id}`, 'DELETE'),
};

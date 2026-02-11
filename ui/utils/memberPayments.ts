import { Member } from '@/types/member';

export type PaymentStatus = 'paid' | 'due' | 'upcoming';

export const DEFAULT_PAYMENT_CYCLE = 1;
export const DEFAULT_UPCOMING_WINDOW_DAYS = 7;

const dateOnly = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate());

const isValidDate = (value: Date) => !Number.isNaN(value.getTime());

export const formatDateToISO = (value: Date) => {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const parseDateInput = (value?: string | null) => {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [year, month, day] = trimmed.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    const parsed = new Date(trimmed);
    if (!isValidDate(parsed)) {
        return null;
    }

    return dateOnly(parsed);
};

export const normalizePaymentCycle = (paymentCycle?: number) => {
    if (!Number.isFinite(paymentCycle)) {
        return DEFAULT_PAYMENT_CYCLE;
    }

    return Math.max(1, Math.floor(paymentCycle ?? DEFAULT_PAYMENT_CYCLE));
};

export const addMonths = (value: Date, months: number) => {
    const year = value.getFullYear();
    const month = value.getMonth() + months;
    const day = value.getDate();
    const lastDayOfTargetMonth = new Date(year, month + 1, 0).getDate();
    const safeDay = Math.min(day, lastDayOfTargetMonth);

    return new Date(year, month, safeDay);
};

export const addDays = (value: Date, days: number) => {
    const nextDate = new Date(value);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
};

export const computeNextDueDate = (
    payDate?: string,
    paymentCycle?: number
): string | null => {
    const parsedPayDate = parseDateInput(payDate ?? null);
    if (!parsedPayDate) {
        return null;
    }

    const cycleMonths = normalizePaymentCycle(paymentCycle);
    const nextDate = addMonths(parsedPayDate, cycleMonths);
    return formatDateToISO(nextDate);
};

export const getMemberPaymentStatus = (
    member: Member,
    options?: { currentDate?: Date; upcomingWindowDays?: number }
): PaymentStatus => {
    const currentDate = dateOnly(options?.currentDate ?? new Date());
    const upcomingWindowDays = options?.upcomingWindowDays ?? DEFAULT_UPCOMING_WINDOW_DAYS;

    const paymentCycle = normalizePaymentCycle(member.paymentCycle);
    const computedNextDueDate = computeNextDueDate(member.payDate, paymentCycle);
    const nextDueDate =
        parseDateInput(member.nextDueDate ?? null) ??
        parseDateInput(computedNextDueDate ?? null);

    if (!nextDueDate) {
        return 'due';
    }

    const dueDate = dateOnly(nextDueDate);
    if (currentDate > dueDate) {
        return 'due';
    }

    const upcomingCutoff = new Date(currentDate);
    upcomingCutoff.setDate(currentDate.getDate() + upcomingWindowDays);

    if (dueDate > currentDate && dueDate <= upcomingCutoff) {
        return 'upcoming';
    }

    return 'paid';
};

export const normalizeMemberPaymentFields = (member: Member): Member => {
    const paymentCycle = normalizePaymentCycle(member.paymentCycle);
    const nextDueDate =
        (parseDateInput(member.nextDueDate ?? null) && member.nextDueDate) ||
        computeNextDueDate(member.payDate, paymentCycle) ||
        undefined;

    return {
        ...member,
        paymentCycle,
        nextDueDate,
    };
};

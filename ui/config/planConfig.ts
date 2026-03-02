export type PlanType = 'free' | 'pro' | 'premium';

export interface PlanLimits {
  properties: number;
  tenants: number;
  rooms: number;
  staff: number;
}

export interface PlanConfig {
  currentPlan: PlanType;
  limits: PlanLimits;
  usage: {
    properties: number;
    tenants: number;
    rooms: number;
    staff: number;
  };
}

/**
 * Subscription Plan Limits Configuration
 * 
 * Limit Meanings:
 *   properties: Total number of properties owner can create (per-owner limit)
 *   tenants: Max tenants PER property
 *   rooms: Max rooms PER property
 *   staff: Max staff members PER property
 * 
 * Example (Pro Plan with 3 properties):
 *   - Can create 3 properties total
 *   - Each property can have max 50 tenants
 *   - Each property can have max 50 rooms (3 properties × 50 = 150 total rooms possible)
 *   - Each property can have max 5 staff (3 properties × 5 = 15 total staff possible)
 */
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    properties: 1,
    tenants: 20,
    rooms: 30,
    staff: 3,
  },
  pro: {
    properties: 3,
    tenants: 50,
    rooms: 50,
    staff: 5,
  },
  premium: {
    properties: 5,
    tenants: 100,
    rooms: 70,
    staff: 7,
  },
};

export const planConfig: PlanConfig = {
  currentPlan: 'free',
  limits: PLAN_LIMITS.free,
  usage: {
    properties: 8,
    tenants: 142,
    rooms: 15,
    staff: 0,
  },
};

export const isLimitReached = (type: 'properties' | 'tenants' | 'rooms' | 'staff'): boolean => {
  return planConfig.usage[type] >= planConfig.limits[type];
};

export const getUsagePercentage = (type: 'properties' | 'tenants' | 'rooms'): number => {
  const limit = planConfig.limits[type];
  if (limit === 999) return 10;
  return Math.min((planConfig.usage[type] / limit) * 100, 100);
};

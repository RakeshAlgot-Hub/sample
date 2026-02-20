import { getApi, handleApiError } from '@/lib/api';
export interface PaymentData {
  id: string;
  tenantId: string;
  tenantName: string;
  unitId: string;
  unitName: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'due';
  paidDate?: string;
}

const getPaymentStatus = (dueDate: string): 'paid' | 'due' => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(dueDate);
  date.setHours(0, 0, 0, 0);

  const daysDifference = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDifference < 1) {
    return 'due';
  } else {
    return 'paid'; // treat all future as paid for logic simplicity
  }
};



// Helper to join tenant and unit info
function joinTenantUnitPayments(tenants: any[], units: any[]): PaymentData[] {
  return tenants.map((tenant: any) => {
    const unit = units.find((u: any) => u.id === tenant.unitId);
    // Validate checkInDate
    let checkInDate: Date | null = null;
    try {
      const d = new Date(tenant.checkInDate);
      checkInDate = isNaN(d.getTime()) ? null : d;
    } catch {
      checkInDate = null;
    }
    // Validate depositAmount
    let amount = parseFloat(tenant.depositAmount || '0');
    if (isNaN(amount)) amount = 0;

    // Calculate dueDate
    let dueDateStr = '';
    if (checkInDate) {
      const dueDate = new Date(checkInDate);
      dueDate.setMonth(dueDate.getMonth() + 1);
      dueDateStr = dueDate.toISOString().split('T')[0];
    }

    return {
      id: tenant.id,
      tenantId: tenant.id,
      tenantName: tenant.fullName,
      unitId: tenant.unitId,
      unitName: unit?.name || 'N/A',
      amount,
      dueDate: dueDateStr,
      status: dueDateStr ? getPaymentStatus(dueDateStr) : 'due',
      paidDate: undefined,
    };
  });
}

export const paymentService = {
    async updatePaymentStatus(tenantId: string, status: 'paid' | 'due'): Promise<void> {
      try {
        const api = getApi();
        await api.patch(`/tenants/${tenantId}`, { status });
      } catch (error) {
        throw handleApiError(error);
      }
    },
  async getPayments(propertyId: string): Promise<PaymentData[]> {
    try {
      const api = getApi();
      const [tenantsRes, unitsRes] = await Promise.all([
        api.get('/tenants', { params: { propertyId } }),
        api.get('/units', { params: { propertyId } }),
      ]);
      return joinTenantUnitPayments(tenantsRes.data, unitsRes.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getPaidPayments(propertyId: string): Promise<PaymentData[]> {
    const all = await this.getPayments(propertyId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return all.filter((p) => {
      if (!p.paidDate) return false;
      const paidDate = new Date(p.paidDate);
      paidDate.setHours(0, 0, 0, 0);
      return paidDate < today;
    });
  },

  async getDuePayments(propertyId: string): Promise<PaymentData[]> {
    const all = await this.getPayments(propertyId);
    return all.filter((p) => p.status === 'due');
  },

  // removed getUpcomingPayments
};

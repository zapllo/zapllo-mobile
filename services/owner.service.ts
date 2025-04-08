import { apiClient } from './api.config';

export interface OwnerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  // Add other relevant fields
}

export interface BusinessStats {
  totalOrders: number;
  totalRevenue: number;
  activeCustomers: number;
  // Add other relevant statistics
}

export const OwnerService = {
  // Get owner profile information
  async getProfile(): Promise<OwnerProfile> {
    const response = await apiClient.get('/owner/profile');
    return response.data;
  },

  // Update owner profile
  async updateProfile(data: Partial<OwnerProfile>): Promise<OwnerProfile> {
    const response = await apiClient.put('/owner/profile', data);
    return response.data;
  },

  // Get business statistics
  async getBusinessStats(period: 'day' | 'week' | 'month' | 'year'): Promise<BusinessStats> {
    const response = await apiClient.get('/owner/stats', {
      params: { period }
    });
    return response.data;
  },

  // Get list of orders
  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await apiClient.get('/owner/orders', { params });
    return response.data;
  },

  // Get order details
  async getOrderDetails(orderId: string) {
    const response = await apiClient.get(`/owner/orders/${orderId}`);
    return response.data;
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string) {
    const response = await apiClient.put(`/owner/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Get customer list
  async getCustomers(params: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const response = await apiClient.get('/owner/customers', { params });
    return response.data;
  },

  // Get customer details
  async getCustomerDetails(customerId: string) {
    const response = await apiClient.get(`/owner/customers/${customerId}`);
    return response.data;
  },

  // Get inventory items
  async getInventory(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) {
    const response = await apiClient.get('/owner/inventory', { params });
    return response.data;
  },

  // Update inventory item
  async updateInventoryItem(itemId: string, data: any) {
    const response = await apiClient.put(`/owner/inventory/${itemId}`, data);
    return response.data;
  },

  // Generate reports
  async generateReport(params: {
    type: 'sales' | 'inventory' | 'customers';
    startDate: string;
    endDate: string;
    format?: 'pdf' | 'csv';
  }) {
    const response = await apiClient.post('/owner/reports/generate', params);
    return response.data;
  }
}; 
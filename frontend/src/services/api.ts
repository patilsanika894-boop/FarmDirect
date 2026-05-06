const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...(options.headers as Record<string, string>),
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ================= AUTH =================
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  // ================= PRODUCTS =================
  async getProducts(params: any = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    const url = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url);
  }

  async getProductById(id: string) {
    return this.request(`/products/${id}`);
  }

  async searchProducts(query: string, params: any = {}) {
    return this.getProducts({ ...params, search: query });
  }

  async getFeaturedProducts(limit?: number) {
    const url = limit ? `/products/featured?limit=${limit}` : '/products/featured';
    return this.request(url);
  }

  async getProductsByCategory(category: string, params: any = {}) {
    return this.getProducts({ ...params, category });
  }

  // ✅ NEW: Create a product (farmer only)
  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  // ✅ NEW: Update a product (farmer only)
  async updateProduct(productId: string, productData: any) {
    return this.request(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  // ================= CART =================
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId: string, quantity: number) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(productId: string, quantity: number) {
    return this.request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async removeFromCart(productId: string) {
    return this.request(`/cart/remove/${productId}`, { method: 'DELETE' });
  }

  async clearCart() {
    return this.request('/cart/clear', { method: 'DELETE' });
  }

  async getCartSummary() {
    return this.request('/cart/summary');
  }

  // ================= ORDERS =================

  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async createCODOrder(orderData: any) {
    return this.request('/payments/cod', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params: any = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    const url = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url);
  }

  async getOrderById(id: string) {
    return this.request(`/orders/${id}`);
  }

  async getCustomerOrders(status?: string) {
    const url = status && status !== 'all'
      ? `/orders/my-orders?status=${status}`
      : '/orders/my-orders';
    return this.request(url);
  }

  async cancelOrder(id: string, reason?: string) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason: reason || 'Cancelled by customer' }),
    });
  }

  async updatePayment(id: string, paymentMethod: string, upiApp?: string, upiTransactionId?: string) {
    return this.request(`/orders/${id}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ paymentMethod, upiApp, upiTransactionId }),
    });
  }

  async getInvoice(id: string) {
    return this.request(`/orders/${id}/invoice`);
  }

  async getOrderTracking(id: string) {
    return this.request(`/orders/${id}/tracking`);
  }

  // ================= USERS =================
  async updateProfile(userData: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getFarmers() {
    return this.request('/users/farmers');
  }

  async getUsers() {
    return this.request('/admin/users');
  }

  async getFarmerOrders() {
    return this.request('/orders/farmer-orders');
  }

  async blockUser(userId: string, block: boolean) {
    return this.request(`/admin/users/${userId}/block`, {
      method: 'PUT',
      body: JSON.stringify({ block }),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  async deleteProduct(productId: string) {
    return this.request(`/products/${productId}`, { method: 'DELETE' });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

export const apiService = new ApiService();
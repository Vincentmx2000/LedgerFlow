/**
 * LedgerFlow API Service
 * Centralized API client with automatic JWT token injection and error handling.
 */

const BASE_URL = '/api';

class ApiService {
  getToken() {
    return localStorage.getItem('ledgerflow_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('ledgerflow_token', token);
    } else {
      localStorage.removeItem('ledgerflow_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      // Re-throw with descriptive message
      throw err;
    }
  }

  // Auth Endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getMe() {
    return this.request('/auth/me', {
      method: 'GET',
    });
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // System Health
  async getHealth() {
    return this.request('/health', {
      method: 'GET',
    });
  }

  // People / Contacts Endpoints
  async getPeople(params = {}) {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'All') {
      query.append('type', params.type);
    }
    if (params.role && params.role !== 'All') {
      query.append('role', params.role);
    }
    if (params.group && params.group !== 'All') {
      query.append('group', params.group);
    }
    if (params.search && params.search.trim()) {
      query.append('search', params.search.trim());
    }

    const qs = query.toString();
    const endpoint = qs ? `/people?${qs}` : '/people';
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async getPerson(id) {
    return this.request(`/people/${id}`, {
      method: 'GET',
    });
  }

  async createPerson(personData) {
    return this.request('/people', {
      method: 'POST',
      body: JSON.stringify(personData),
    });
  }

  async updatePerson(id, personData) {
    return this.request(`/people/${id}`, {
      method: 'PUT',
      body: JSON.stringify(personData),
    });
  }

  async deletePerson(id) {
    return this.request(`/people/${id}`, {
      method: 'DELETE',
    });
  }

  // Roles Endpoints
  async getRoles() {
    return this.request('/roles', {
      method: 'GET',
    });
  }

  async createRole(roleData) {
    return this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(typeof roleData === 'string' ? { name: roleData } : roleData),
    });
  }

  // Transactions Endpoints
  async getTransactions(params = {}) {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'All') {
      query.append('type', params.type);
    }
    if (params.search && params.search.trim()) {
      query.append('search', params.search.trim());
    }
    if (params.party) {
      query.append('party', params.party);
    }
    if (params.category) {
      query.append('category', params.category);
    }
    if (params.uncategorized) {
      query.append('uncategorized', 'true');
    }

    const qs = query.toString();
    const endpoint = qs ? `/transactions?${qs}` : '/transactions';
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async getTransaction(id) {
    return this.request(`/transactions/${id}`, {
      method: 'GET',
    });
  }

  async createTransaction(transactionData) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async updateTransaction(id, transactionData) {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  }

  async deleteTransaction(id) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Vault Endpoints
  async getVaults(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') {
      query.append('status', params.status);
    }
    if (params.search && params.search.trim()) {
      query.append('search', params.search.trim());
    }

    const qs = query.toString();
    const endpoint = qs ? `/vaults?${qs}` : '/vaults';
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async getVault(id) {
    return this.request(`/vaults/${id}`, {
      method: 'GET',
    });
  }

  async createVault(vaultData) {
    return this.request('/vaults', {
      method: 'POST',
      body: JSON.stringify(vaultData),
    });
  }

  async addCashToVault(id, amount) {
    return this.request(`/vaults/${id}/add-cash`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async markVaultClaimed(id) {
    return this.request(`/vaults/${id}/claim`, {
      method: 'PUT',
    });
  }

  async deleteVault(id) {
    return this.request(`/vaults/${id}`, {
      method: 'DELETE',
    });
  }

  // Split & Collect Endpoints
  async getSplitCollections() {
    return this.request('/split-collections', {
      method: 'GET',
    });
  }

  async getSplitCollection(id) {
    return this.request(`/split-collections/${id}`, {
      method: 'GET',
    });
  }

  async createSplitCollection(collectionData) {
    return this.request('/split-collections', {
      method: 'POST',
      body: JSON.stringify(collectionData),
    });
  }

  async updateParticipantStatus(collectionId, participantId, status = 'Paid') {
    return this.request(`/split-collections/${collectionId}/participants/${participantId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteSplitCollection(id) {
    return this.request(`/split-collections/${id}`, {
      method: 'DELETE',
    });
  }

  // Planner Endpoints
  async getPlans(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') {
      query.append('status', params.status);
    }
    if (params.activityType && params.activityType !== 'All') {
      query.append('activityType', params.activityType);
    }
    if (params.search && params.search.trim()) {
      query.append('search', params.search.trim());
    }

    const qs = query.toString();
    const endpoint = qs ? `/plans?${qs}` : '/plans';
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async getPlan(id) {
    return this.request(`/plans/${id}`, {
      method: 'GET',
    });
  }

  async createPlan(planData) {
    return this.request('/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updatePlan(id, planData) {
    return this.request(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  async markPlanCompleted(id, status = 'Completed') {
    return this.request(`/plans/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deletePlan(id) {
    return this.request(`/plans/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();

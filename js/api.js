/* ============================================================
   TRAVELOOP – API Service Layer
   ============================================================ */

const API_BASE_URL = 'http://localhost:5000/api';

const API = {
  _token: localStorage.getItem('tl_auth_token'),

  setToken(token) {
    this._token = token;
    if (token) localStorage.setItem('tl_auth_token', token);
    else localStorage.removeItem('tl_auth_token');
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this._token) {
      headers['Authorization'] = `Bearer ${this._token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
          // Don't navigate here, it causes race conditions in the router.
          // The router or caller should catch this.
          throw new Error('UNAUTHORIZED');
        }
        throw new Error(data.msg || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  },

  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  signup(name, email, password) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  // Trips
  getTrips() {
    return this.request('/trips');
  },

  getTrip(id) {
    return this.request(`/trips/${id}`);
  },

  saveTrip(tripData) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData)
    });
  },

  // Itinerary
  saveItinerary(tripId, stops) {
    return this.request('/itinerary', {
      method: 'POST',
      body: JSON.stringify({ tripId, stops })
    });
  },

  // Dashboard
  getDashboardData() {
    return this.request('/dashboard');
  },
  getAdminStats() {
    return this.request('/admin/stats');
  }
};

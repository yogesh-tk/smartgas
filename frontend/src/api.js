/**
 * Bharat Scheme Centralized API Client
 */
const BASE_URL = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('bharat_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth & Profile
  sendEmailOtp: (body) => apiRequest('/auth/send-email-otp', { method: 'POST', body: JSON.stringify(body) }),
  verifyEmailOtp: (body) => apiRequest('/auth/verify-email-otp', { method: 'POST', body: JSON.stringify(body) }),
  chat: (body) => apiRequest('/chat', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => apiRequest('/auth/profile'),
  updateProfile: (body) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // LPG Connections
  getProviders: () => apiRequest('/lpg/providers'),
  verifyConsumer: (body) => apiRequest('/lpg/verify-consumer', { method: 'POST', body: JSON.stringify(body) }),
  linkConnection: (body) => apiRequest('/lpg/link-connection', { method: 'POST', body: JSON.stringify(body) }),
  getMyConnections: () => apiRequest('/lpg/my-connections'),
  getConnectionDetails: (id) => apiRequest(`/lpg/connections/${id}`),
  unlinkConnection: (id) => apiRequest(`/lpg/connections/${id}`, { method: 'DELETE' }),

  // Refill Bookings & Tracking
  bookRefill: (body) => apiRequest('/bookings/book', { method: 'POST', body: JSON.stringify(body) }),
  trackBooking: (ref) => apiRequest(`/bookings/track/${ref}`),
  cancelBooking: (ref, body) => apiRequest(`/bookings/cancel/${ref}`, { method: 'POST', body: JSON.stringify(body) }),
  getMyBookings: () => apiRequest('/bookings/my-bookings'),
  getReceipt: (ref) => apiRequest(`/bookings/receipt/${ref}`),

  // Family Gas Hub & Consent
  getFamilyMembers: () => apiRequest('/family/members'),
  inviteFamilyMember: (body) => apiRequest('/family/invite', { method: 'POST', body: JSON.stringify(body) }),
  revokeFamilyConsent: (id) => apiRequest(`/family/members/${id}`, { method: 'DELETE' }),
  getConsentDetails: (token) => apiRequest(`/family/consent/${token}`),
  respondConsent: (token, decision) => apiRequest(`/family/consent/${token}/respond`, { method: 'POST', body: JSON.stringify({ decision }) }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotifRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotifsRead: () => apiRequest('/notifications/read-all', { method: 'PUT' }),
  checkReminders: () => apiRequest('/notifications/check-reminders', { method: 'POST' }),

  // Support & Emergency 1906
  createTicket: (body) => apiRequest('/support/tickets', { method: 'POST', body: JSON.stringify(body) }),
  getMyTickets: () => apiRequest('/support/my-tickets'),

  // Admin Dashboard
  getAdminStats: () => apiRequest('/admin/stats'),
  getAdminUsers: (search) => apiRequest(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getAdminProviders: () => apiRequest('/admin/providers'),
  updateAdminProvider: (id, body) => apiRequest(`/admin/providers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getAdminDemoRecords: () => apiRequest('/admin/demo-records'),
  advanceBooking: (ref, nextStatus) => apiRequest(`/admin/bookings/${ref}/advance`, { method: 'POST', body: JSON.stringify({ nextStatus }) }),
  getAdminTickets: () => apiRequest('/admin/tickets'),
  updateAdminTicket: (id, body) => apiRequest(`/admin/tickets/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  // System Health
  getHealth: () => apiRequest('/health'),
};

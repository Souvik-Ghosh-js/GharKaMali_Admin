import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = Cookies.get('admin_token') || (typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      Cookies.remove('admin_token');
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const adminLogin = (data: any) => api.post('/auth/admin-login', data);
export const getProfile = () => api.get('/auth/profile');

// Dashboard
export const getDashboard = () => api.get('/admin/dashboard');
export const getAnalytics = (params?: any) => api.get('/admin/analytics', { params });

// Gardeners
export const getGardeners = (params?: any) => api.get('/admin/gardeners', { params });
export const approveGardener = (data: any) => api.post('/admin/gardeners/approve', data);
export const rejectGardener = (data: any) => api.post('/admin/gardeners/reject', data);

// Customers
export const getCustomers = (params?: any) => api.get('/admin/customers', { params });

// Bookings
export const getAllBookings = (params?: any) => api.get('/admin/bookings', { params });

// Subscriptions
export const getAllSubscriptions = (params?: any) => api.get('/admin/subscriptions', { params });

// Zones
export const getZones = () => api.get('/admin/zones');
export const createZone = (data: any) => api.post('/admin/zones', data);
export const updateZone = (id: number, data: any) => api.put(`/admin/zones/${id}`, data);

// Plans
export const getPlans = () => api.get('/plans');
export const createPlan = (data: any) => api.post('/admin/plans', data);
export const updatePlan = (id: number, data: any) => api.put(`/admin/plans/${id}`, data);

// Supervisors (admin-side)
export const getSupervisors = () => api.get('/admin/supervisors');
export const createSupervisor = (data: any) => api.post('/admin/supervisors', data);
export const updateSupervisor = (id: number, data: any) => api.put(`/admin/supervisors/${id}`, data);
export const deleteSupervisor = (id: number) => api.delete(`/admin/supervisors/${id}`);

// Supervisor portal APIs (called when logged-in user is a supervisor)
export const getSupervisorDashboard = () => api.get('/supervisor/dashboard');
export const getMyGardeners = (params?: any) => api.get('/supervisor/gardeners', { params });
export const getUnassignedGardeners = () => api.get('/supervisor/gardeners/unassigned');
export const getMyGardenerDetail = (id: number) => api.get(`/supervisor/gardeners/${id}`);
export const updateMyGardener = (id: number, data: any) => api.put(`/supervisor/gardeners/${id}`, data);
export const approveMyGardener = (id: number) => api.post(`/supervisor/gardeners/${id}/approve`);
export const rejectMyGardener = (id: number) => api.post(`/supervisor/gardeners/${id}/reject`);
export const toggleMyGardener = (id: number, is_active: boolean) => api.post(`/supervisor/gardeners/${id}/toggle`, { is_active });
export const assignMyGardener = (id: number) => api.post(`/supervisor/gardeners/${id}/assign`);
export const unassignMyGardener = (id: number) => api.post(`/supervisor/gardeners/${id}/unassign`);
export const assignGardenerZones = (id: number, geofence_ids: number[]) => api.post(`/supervisor/gardeners/${id}/zones`, { geofence_ids });
export const getMyBookings = (params?: any) => api.get('/supervisor/bookings', { params });
export const giveReward = (data: any) => api.post('/supervisor/rewards', data);
export const getMyRewards = () => api.get('/supervisor/rewards');
export const getMyComplaints = () => api.get('/supervisor/complaints');
export const getGeofences = () => api.get('/geofences');

// Rewards
export const getRewards = (params?: any) => api.get('/admin/rewards', { params });
export const createReward = (data: any) => api.post('/admin/rewards', data);

// Price hike
export const applyPriceHike = (data: any) => api.post('/admin/price-hike', data);

// Blogs
export const getBlogs = (params?: any) => api.get('/blogs', { params });
export const createBlog = (data: FormData) => api.post('/admin/blogs', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateBlog = (id: number, data: FormData) => api.put(`/admin/blogs/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteBlog = (id: number) => api.delete(`/admin/blogs/${id}`);

// City pages
export const getCityPages = () => api.get('/cities');
export const upsertCityPage = (data: any) => api.post('/admin/cities', data);

// Payments
export const getAllPayments = (params?: any) => api.get('/admin/payments', { params })

// Supervisor management (additional)
export const assignGardenerToSupervisor = (gardenerId: number, supervisorId: number) =>
  api.post('/admin/gardeners/approve', { user_id: gardenerId, supervisor_id: supervisorId })

// Scheduled price hikes
export const getPriceHikeSchedules = () => api.get('/admin/price-hike/schedules')
export const schedulePriceHike = (data: any) => api.post('/admin/price-hike/schedule', data)
export const deletePriceHikeSchedule = (id: number) => api.delete(`/admin/price-hike/schedule/${id}`)

// Utilization report
export const getUtilizationReport = (params?: any) => api.get('/admin/utilization', { params })

// Complaints — Ticketing
export const getComplaints = (params?: any) => api.get('/complaints', { params })
export const getComplaintStats = () => api.get('/complaints/stats')
export const getComplaintDetail = (id: number) => api.get(`/complaints/${id}`)
export const updateComplaint = (id: number, data: any) => api.put(`/complaints/${id}`, data)
export const addComplaintComment = (id: number, data: FormData) =>
  api.post(`/complaints/${id}/comments`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
export const getComplaintDepartments = () => api.get('/complaints/departments')
export const createComplaintDepartment = (data: any) => api.post('/admin/complaints/departments', data)
export const updateComplaintDepartment = (id: number, data: any) => api.put(`/admin/complaints/departments/${id}`, data)
export const deleteComplaintDepartment = (id: number) => api.delete(`/admin/complaints/departments/${id}`)
export const getComplaintAssignees = () => api.get('/admin/complaints/assignees')

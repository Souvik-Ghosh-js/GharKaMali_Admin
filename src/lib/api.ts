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

// Supervisors
export const getSupervisors = () => api.get('/admin/supervisors');
export const createSupervisor = (data: any) => api.post('/admin/supervisors', data);

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

// Complaints
export const getComplaints = (params?: any) => api.get('/complaints', { params })
export const getComplaintStats = () => api.get('/complaints/stats')
export const updateComplaint = (id: number, data: any) => api.put(`/complaints/${id}`, data)

// API Client for communicating with Fostercore backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private pendingRequests: Map<string, Promise<any>>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.pendingRequests = new Map();
  }

  private getCacheKey(endpoint: string, options: RequestInit): string {
    return `${options.method || 'GET'}_${endpoint}_${JSON.stringify(options.body || '')}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const cacheKey = this.getCacheKey(endpoint, options);

    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const requestPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error: data.error || `API Error (${response.status}): ${response.statusText}`,
            message: data.message
          };
        }

        return data;
      } catch (error: any) {
        console.error(`API Request Error (${endpoint}):`, error);
        return {
          success: false,
          error: error.message || 'Cannot connect to backend server.'
        };
      } finally {
        this.pendingRequests.delete(cacheKey);
      }
    })();

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) });
  }

  async put<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (mobile: string, password: string) =>
    apiClient.post('/auth/login', { mobile, password }),
  register: (data: any) => apiClient.post('/auth/register', data),
};

// ─── Students ────────────────────────────────────────────────────────────────
export const studentsApi = {
  list: (params?: { class?: string; section?: string; status?: string }) => {
    let url = '/students/list';
    if (params) {
      const q = new URLSearchParams();
      if (params.class) q.append('class', params.class);
      if (params.section) q.append('section', params.section);
      if (params.status) q.append('status', params.status);
      if (q.toString()) url += `?${q}`;
    }
    return apiClient.get(url);
  },
  admit: (data: any) => apiClient.post('/students/admit', data),
  update: (id: string, data: any) => apiClient.put(`/students/update/${id}`, data),
  delete: (id: string) => apiClient.delete(`/students/delete/${id}`),
  getTeachers: () => apiClient.get('/students/teachers'),
};

// ─── Staff ───────────────────────────────────────────────────────────────────
export const staffApi = {
  list: () => apiClient.get('/staff/list'),
  add: (data: any) => apiClient.post('/staff/add', data),
  update: (id: string, data: any) => apiClient.put(`/staff/update/${id}`, data),
  toggleStatus: (id: string, status: string) => apiClient.put(`/staff/toggle-status/${id}`, { status }),
  delete: (id: string) => apiClient.delete(`/staff/delete/${id}`),
  getAssignedClasses: () => apiClient.get('/staff/assigned-classes'),
  getAttendance: (params?: { date?: string; staffId?: string; startDate?: string; endDate?: string }) => {
    let url = '/staff/attendance';
    if (params) {
      const q = new URLSearchParams();
      if (params.date) q.append('date', params.date);
      if (params.staffId) q.append('staffId', params.staffId);
      if (params.startDate) q.append('startDate', params.startDate);
      if (params.endDate) q.append('endDate', params.endDate);
      if (q.toString()) url += `?${q}`;
    }
    return apiClient.get(url);
  },
  markAttendance: (data: any) => apiClient.post('/staff/attendance', data),
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendanceApi = {
  getStudentAttendance: (params?: { date?: string; studentId?: string; startDate?: string; endDate?: string; class?: string; section?: string }) => {
    let url = '/attendance/student';
    if (params) {
      const q = new URLSearchParams();
      if (params.date) q.append('date', params.date);
      if (params.studentId) q.append('studentId', params.studentId);
      if (params.startDate) q.append('startDate', params.startDate);
      if (params.endDate) q.append('endDate', params.endDate);
      if (params.class) q.append('class', params.class);
      if (params.section) q.append('section', params.section);
      if (q.toString()) url += `?${q}`;
    }
    return apiClient.get(url);
  },
  markStudentAttendance: (data: any) => apiClient.post('/attendance/student', data),
  mark: (data: any) => apiClient.post('/attendance/mark', data),
  getMyAttendance: (studentId: string, startDate?: string, endDate?: string) => {
    let url = `/attendance/my-attendance?studentId=${studentId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return apiClient.get(url);
  },
};

// ─── Fees ─────────────────────────────────────────────────────────────────────
export const feesApi = {
  getMyFees: (studentId: string) => apiClient.get(`/fees/my-fees?studentId=${studentId}`),
  list: (params?: { class?: string; section?: string; status?: string; year?: string }) => {
    let url = '/fees/list';
    if (params) {
      const q = new URLSearchParams();
      if (params.class) q.append('class', params.class);
      if (params.section) q.append('section', params.section);
      if (params.status) q.append('status', params.status);
      if (params.year) q.append('year', params.year);
      if (q.toString()) url += `?${q}`;
    }
    return apiClient.get(url);
  },
  summary: () => apiClient.get('/fees/summary'),
  update: (data: any) => apiClient.put('/fees/update', data),
  collect: (data: any) => apiClient.post('/fees/collect', data),
};

// ─── Progress ─────────────────────────────────────────────────────────────────
export const progressApi = {
  add: (data: any) => apiClient.post('/progress/add', data),
  update: (id: string, data: any) => apiClient.put(`/progress/${id}`, data),
  delete: (id: string) => apiClient.delete(`/progress/${id}`),
  getMyProgress: (studentId: string, term?: string) => {
    let url = `/progress/my-progress?studentId=${studentId}`;
    if (term) url += `&term=${term}`;
    return apiClient.get(url);
  },
  getStudentProgress: (studentId: string) => apiClient.get(`/progress/student/${studentId}`),
};

// ─── Behaviour ────────────────────────────────────────────────────────────────
export const behaviourApi = {
  add: (data: any) => apiClient.post('/behaviour/add', data),
  list: (params?: { class?: string; section?: string }) => {
    let url = '/behaviour/list';
    if (params) {
      const q = new URLSearchParams();
      if (params.class) q.append('class', params.class);
      if (params.section) q.append('section', params.section);
      if (q.toString()) url += `?${q}`;
    }
    return apiClient.get(url);
  },
  getMyBehaviour: (studentId: string, startDate?: string, endDate?: string) => {
    let url = `/behaviour/my-behaviour?studentId=${studentId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return apiClient.get(url);
  },
  delete: (id: string) => apiClient.delete(`/behaviour/${id}`),
};

// ─── Homework ─────────────────────────────────────────────────────────────────
export const homeworkApi = {
  list: (studentClass?: string, section?: string) => {
    let url = '/homework/list';
    const params = [];
    if (studentClass) params.push(`studentClass=${studentClass}`);
    if (section) params.push(`section=${section}`);
    if (params.length) url += `?${params.join('&')}`;
    return apiClient.get(url);
  },
  create: (data: any) => apiClient.post('/homework', data),
  update: (id: string, data: any) => apiClient.put(`/homework/${id}`, data),
  delete: (id: string) => apiClient.delete(`/homework/${id}`),
};

// ─── Events ───────────────────────────────────────────────────────────────────
export const eventsApi = {
  list: (userRole?: number) => {
    let url = '/events';
    if (userRole) url += `?userRole=${userRole}`;
    return apiClient.get(url);
  },
  create: (data: any) => apiClient.post('/events', data),
  update: (id: string, data: any) => apiClient.put(`/events/${id}`, data),
  delete: (id: string) => apiClient.delete(`/events/${id}`),
};

// ─── Gallery ──────────────────────────────────────────────────────────────────
export const galleryApi = {
  list: () => apiClient.get('/gallery'),
  add: (data: any) => apiClient.post('/gallery', data),
  update: (id: string, data: any) => apiClient.put(`/gallery/${id}`, data),
  delete: (id: string) => apiClient.delete(`/gallery/${id}`),
};

// ─── Users / Profile ──────────────────────────────────────────────────────────
export const usersApi = {
  getProfile: (userId: string) => apiClient.get(`/users/profile?userId=${userId}`),
  updateProfile: (userId: string, data: any) => apiClient.put('/users/profile', { userId, ...data }),
  changePassword: (data: { userId: string; currentPassword: string; newPassword: string }) =>
    apiClient.put('/users/change-password', data),
};

// ─── Syllabus ─────────────────────────────────────────────────────────────────
export const syllabusApi = {
  list: (studentClass?: string, subject?: string) => {
    let url = '/syllabus/list';
    const params = [];
    if (studentClass) params.push(`studentClass=${studentClass}`);
    if (subject) params.push(`subject=${subject}`);
    if (params.length) url += `?${params.join('&')}`;
    return apiClient.get(url);
  },
  getByClass: (className: string) => apiClient.get(`/syllabus/by-class?className=${encodeURIComponent(className)}`),
  create: (data: any) => apiClient.post('/syllabus', data),
  update: (id: string, data: any) => apiClient.put(`/syllabus/${id}`, data),
  delete: (id: string) => apiClient.delete(`/syllabus/${id}`),
};

// ─── Config ───────────────────────────────────────────────────────────────────
export const configApi = {
  getClasses: () => apiClient.get('/config/classes'),
  getClassStats: () => apiClient.get('/config/class-stats'),
  updateClass: (data: { oldClassName: string; newClassName?: string; teacherId?: string; section?: string }) => apiClient.put('/config/update-class', data),
  getSections: () => apiClient.get('/config/sections'),
  getDepartments: () => apiClient.get('/config/departments'),
  getDesignations: () => apiClient.get('/config/designations'),
  getConstants: () => apiClient.get('/config/constants'),
};

// ─── Salary ───────────────────────────────────────────────────────────────────
export const salaryApi = {
  getHistory: (staffId: string, params?: { month?: string; year?: string }) => {
    let url = `/salary/history/${staffId}`;
    if (params) {
      const q = new URLSearchParams();
      if (params.month) q.append('month', params.month);
      if (params.year) q.append('year', params.year);
      if (q.toString()) url += `?${q}`;
    }
    return apiClient.get(url);
  },
  staffList: (params?: { month?: string; year?: string }) => {
    let url = '/salary/staff-list';
    if (params) {
      const q = new URLSearchParams();
      if (params.month) q.append('month', params.month);
      if (params.year) q.append('year', params.year);
      if (q.toString()) url += `?${q}`;
    }
    return apiClient.get(url);
  },
  summary: (params?: { month?: string; year?: string }) => {
    let url = '/salary/summary';
    if (params) {
      const q = new URLSearchParams();
      if (params.month) q.append('month', params.month);
      if (params.year) q.append('year', params.year);
      if (q.toString()) url += `?${q}`;
    }
    return apiClient.get(url);
  },
  paySalary: (data: any) => apiClient.post('/salary/pay', data),
  updateSalary: (id: string, salary: number) => apiClient.put(`/salary/update-salary/${id}`, { salary }),
  getExportUrl: (month: string, year: string | number) =>
    `${API_BASE_URL}/salary/export?month=${month}&year=${year}`,
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsApi = {
  attendanceSummary: (params?: { class?: string; section?: string; startDate?: string; endDate?: string }) => {
    const q = new URLSearchParams(params as any);
    return apiClient.get(`/reports/attendance-summary${q.toString() ? '?' + q : ''}`);
  },
  staffAttendanceSummary: (params?: { startDate?: string; endDate?: string }) => {
    const q = new URLSearchParams(params as any);
    return apiClient.get(`/reports/staff-attendance-summary${q.toString() ? '?' + q : ''}`);
  },
  feesSummary: (params?: { class?: string; section?: string }) => {
    const q = new URLSearchParams(params as any);
    return apiClient.get(`/reports/fees-summary${q.toString() ? '?' + q : ''}`);
  },
  progressSummary: (params?: { class?: string; section?: string; term?: string }) => {
    const q = new URLSearchParams(params as any);
    return apiClient.get(`/reports/progress-summary${q.toString() ? '?' + q : ''}`);
  },
  exportUrl: (type: string, params: Record<string, string>) => {
    const q = new URLSearchParams({ type, ...params });
    return `${API_BASE_URL}/reports/export-csv?${q}`;
  },
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (userId: string) => apiClient.get(`/notifications?userId=${userId}`),
  readAll: (userId: string) => apiClient.put('/notifications/read-all', { userId }),
};

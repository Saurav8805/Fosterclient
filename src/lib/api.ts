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
    
    // If same request is already in progress, return the existing promise
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
          // Add cache settings for GET requests
          ...(options.method === 'GET' && {
            next: { revalidate: 60 }, // Cache for 60 seconds
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `API Error: ${response.statusText}`);
        }

        return data;
      } catch (error) {
        console.error('API Request Error:', error);
        throw error;
      } finally {
        // Remove from pending requests after completion
        this.pendingRequests.delete(cacheKey);
      }
    })();

    // Store the promise to prevent duplicate requests
    this.pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual API modules for better organization
export const authApi = {
  login: (mobile: string, password: string) =>
    apiClient.post('/auth/login', { mobile, password }),
  register: (data: any) =>
    apiClient.post('/auth/register', data),
};

export const studentsApi = {
  list: () => apiClient.get('/students/list'),
  admit: (data: any) => apiClient.post('/students/admit', data),
  update: (id: string, data: any) => apiClient.put(`/students/update/${id}`, data),
  delete: (id: string) => apiClient.delete(`/students/delete/${id}`),
  getTeachers: () => apiClient.get('/students/teachers'),
};

export const staffApi = {
  list: () => apiClient.get('/staff/list'),
  add: (data: any) => apiClient.post('/staff/add', data),
  update: (id: string, data: any) => apiClient.put(`/staff/update/${id}`, data),
  delete: (id: string) => apiClient.delete(`/staff/delete/${id}`),
  getAttendance: (params?: { date?: string; staffId?: string; startDate?: string; endDate?: string }) => {
    let url = '/staff/attendance';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.date) queryParams.append('date', params.date);
      if (params.staffId) queryParams.append('staffId', params.staffId);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    return apiClient.get(url);
  },
  markAttendance: (data: any) => apiClient.post('/staff/attendance', data),
};

export const attendanceApi = {
  // Student attendance (bulk operations)
  getStudentAttendance: (params?: { date?: string; studentId?: string; startDate?: string; endDate?: string }) => {
    let url = '/attendance/student';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.date) queryParams.append('date', params.date);
      if (params.studentId) queryParams.append('studentId', params.studentId);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    return apiClient.get(url);
  },
  markStudentAttendance: (data: any) => apiClient.post('/attendance/student', data),
  
  // Legacy single student attendance
  mark: (data: any) => apiClient.post('/attendance/mark', data),
  getMyAttendance: (studentId: string, startDate?: string, endDate?: string) => {
    let url = `/attendance/my-attendance?studentId=${studentId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return apiClient.get(url);
  },
};

export const feesApi = {
  getMyFees: (studentId: string) => 
    apiClient.get(`/fees/my-fees?studentId=${studentId}`),
  update: (data: any) => apiClient.put('/fees/update', data),
};

export const progressApi = {
  add: (data: any) => apiClient.post('/progress/add', data),
  getMyProgress: (studentId: string, term?: string) => {
    let url = `/progress/my-progress?studentId=${studentId}`;
    if (term) url += `&term=${term}`;
    return apiClient.get(url);
  },
};

export const behaviourApi = {
  add: (data: any) => apiClient.post('/behaviour/add', data),
  getMyBehaviour: (studentId: string, startDate?: string, endDate?: string) => {
    let url = `/behaviour/my-behaviour?studentId=${studentId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return apiClient.get(url);
  },
};

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

export const eventsApi = {
  list: () => apiClient.get('/events'),
  create: (data: any) => apiClient.post('/events', data),
  update: (id: string, data: any) => apiClient.put(`/events/${id}`, data),
  delete: (id: string) => apiClient.delete(`/events/${id}`),
};

export const galleryApi = {
  list: () => apiClient.get('/gallery'),
  add: (data: any) => apiClient.post('/gallery', data),
  delete: (id: string) => apiClient.delete(`/gallery/${id}`),
};

export const usersApi = {
  getProfile: (userId: string) => 
    apiClient.get(`/users/profile?userId=${userId}`),
  updateProfile: (userId: string, data: any) =>
    apiClient.put('/users/profile', { userId, ...data }),
};

export const syllabusApi = {
  list: (studentClass?: string, subject?: string) => {
    let url = '/syllabus/list';
    const params = [];
    if (studentClass) params.push(`studentClass=${studentClass}`);
    if (subject) params.push(`subject=${subject}`);
    if (params.length) url += `?${params.join('&')}`;
    return apiClient.get(url);
  },
  create: (data: any) => apiClient.post('/syllabus', data),
  update: (id: string, data: any) => apiClient.put(`/syllabus/${id}`, data),
  delete: (id: string) => apiClient.delete(`/syllabus/${id}`),
};

export const configApi = {
  getClasses: () => apiClient.get('/config/classes'),
  getClassStats: () => apiClient.get('/config/class-stats'),
  getSections: () => apiClient.get('/config/sections'),
  getDepartments: () => apiClient.get('/config/departments'),
  getDesignations: () => apiClient.get('/config/designations'),
  getConstants: () => apiClient.get('/config/constants'),
};

export const salaryApi = {
  getHistory: (staffId: string) => apiClient.get(`/salary/history/${staffId}`),
  paySalary: (data: any) => apiClient.post('/salary/pay', data),
};

// Base URL for API (XAMPP)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/crm_task_planner';
export const API_ENDPOINT = `${API_BASE_URL}/api.php`;

// Log the API endpoint for debugging
console.log('API Base URL:', API_BASE_URL);
console.log('API Endpoint:', API_ENDPOINT);

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache helper functions
const getFromCache = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setInCache = (key: string, data: unknown) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Clear cache for specific keys
const clearCache = (key: string) => {
  cache.delete(key);
};

// Clear commonly used caches after data modifications
const clearCommonCaches = () => {
  clearCache('tasks');
  clearCache('deleted_tasks');
  clearCache('dashboard_summary');
  clearCache('recent_tasks');
  clearCache('dashboard_charts');
  clearCache('projects');
  clearCache('clients');
  clearCache('active_projects');
};

// Data types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: string;
}

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status_id?: number;
  project_id?: number;
  assigned_to?: number;
  due_date?: string;
  priority: 'Low' | 'Medium' | 'High';
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
}

export interface Project {
  id?: number;
  title: string;
  description?: string;
  status: 'Active' | 'Completed' | 'Archived';
  start_date?: string;
  end_date?: string;
  priority: 'Low' | 'Medium' | 'High';
  client_id?: number;
  client_name?: string;
  created_at?: string;
  updated_at?: string;
  hourly_rate?: number;
}

export interface Client {
  id?: number;
  name: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  created_by?: number;
  created_at?: string;
}

export interface ClientWithProjects extends Client {
  projects?: Project[];
}

const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 3): Promise<Response> => {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        return response;
      }
      
      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status}`);
      }
      
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      
      throw new Error(`Server error after ${retries + 1} attempts: ${response.status}`);
    } catch (error) {
      // Retry on network errors or timeouts
      if (i < retries && (error.name === 'TypeError' || error.name === 'TimeoutError')) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Unexpected error in fetchWithRetry');
};

// Helper function to ensure numeric values
const ensureNumericValues = (task: Partial<Task>): Task => {
  return {
    ...task,
    estimated_hours: task.estimated_hours ? Number(task.estimated_hours) : undefined,
    actual_hours: task.actual_hours ? Number(task.actual_hours) : undefined
  } as Task;
};

export const taskAPI = {
  getTasks: async (showDeleted: boolean = false): Promise<Task[]> => {
    const cacheKey = showDeleted ? 'deleted_tasks' : 'tasks';
    const cached = getFromCache(cacheKey);
    if (cached) return cached as Task[];

    const response = await fetch(`${API_ENDPOINT}?action=tasks&deleted=${showDeleted ? 'true' : 'false'}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const data = await response.json();
    // Ensure numeric values for hours
    const tasks = Array.isArray(data) ? data.map(ensureNumericValues) : [];
    setInCache(cacheKey, tasks);
    return tasks;
  },

  createTask: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
    const response = await fetch(`${API_ENDPOINT}?action=tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) throw new Error('Failed to create task');
    const data = await response.json();
    clearCommonCaches();
    return ensureNumericValues(data);
  },

  updateTask: async (id: number, task: Partial<Task>): Promise<Task> => {
    const response = await fetch(`${API_ENDPOINT}?action=tasks&id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) throw new Error('Failed to update task');
    const data = await response.json();
    clearCommonCaches();
    return ensureNumericValues(data);
  },

  deleteTask: async (id: number): Promise<void> => {
    const response = await fetch(`${API_ENDPOINT}?action=tasks&id=${id}&permanent=false`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete task');
    }
    clearCommonCaches();
  },
};

export const projectAPI = {
  getProjects: async (): Promise<Project[]> => {
    const cacheKey = 'projects';
    const cached = getFromCache(cacheKey);
    if (cached) return cached as Project[];

    const response = await fetch(`${API_ENDPOINT}?action=projects`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch projects');
    const data = await response.json();
    
    const projects: Project[] = data.map((project: Project) => ({
      ...project,
      hourly_rate: project.hourly_rate ? Number(project.hourly_rate) : undefined
    }));
    
    setInCache(cacheKey, projects);
    return projects;
  },

  createProject: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> => {
    const projectData = {
      ...project,
      hourly_rate: project.hourly_rate ? Number(project.hourly_rate) : undefined
    };
    
    const response = await fetch(`${API_ENDPOINT}?action=projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(projectData),
    });
    if (!response.ok) throw new Error('Failed to create project');
    const data = await response.json();
    clearCommonCaches();
    return data;
  },

  updateProject: async (id: number, project: Partial<Project>): Promise<Project> => {
    const projectData = {
      ...project,
      hourly_rate: project.hourly_rate !== undefined ? Number(project.hourly_rate) : undefined
    };
    
    const response = await fetch(`${API_ENDPOINT}?action=projects&id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(projectData),
    });
    if (!response.ok) throw new Error('Failed to update project');
    const data = await response.json();
    clearCommonCaches();
    return data;
  },

  deleteProject: async (id: number): Promise<void> => {
    const response = await fetch(`${API_ENDPOINT}?action=projects&id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete project');
    clearCommonCaches();
  },
};

export const clientAPI = {
  getClients: async (): Promise<Client[]> => {
    const cacheKey = 'clients';
    const cached = getFromCache(cacheKey);
    if (cached) return cached as Client[];

    const response = await fetch(`${API_ENDPOINT}?action=clients`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch clients');
    const data = await response.json();
    setInCache(cacheKey, data);
    return data;
  },

  createClient: async (client: Omit<Client, 'id' | 'created_at' | 'created_by'>): Promise<Client> => {
    const response = await fetch(`${API_ENDPOINT}?action=clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(client),
    });
    if (!response.ok) throw new Error('Failed to create client');
    const data = await response.json();
    clearCommonCaches();
    return data;
  },

  updateClient: async (id: number, client: Partial<Client>): Promise<Client> => {
    const response = await fetch(`${API_ENDPOINT}?action=clients&id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(client),
    });
    if (!response.ok) throw new Error('Failed to update client');
    const data = await response.json();
    clearCommonCaches();
    return data;
  },

  deleteClient: async (id: number): Promise<void> => {
    const response = await fetch(`${API_ENDPOINT}?action=clients&id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete client');
    clearCommonCaches();
  },
};

// Extend the User interface for update operations that may include password
export interface UserUpdateData extends Partial<User> {
  password?: string;
}

export const authAPI = {
  login: async (credentials: LoginData): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_ENDPOINT}?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    
    // Check if response has proper structure
    if (!data.user || !data.user.id) {
      console.error('Invalid login response:', data);
      throw new Error('Invalid response from server');
    }
    
    localStorage.setItem('token', data.token);
    return data;
  },

  register: async (userData: RegisterData): Promise<User> => {
    const response = await fetch(`${API_ENDPOINT}?action=register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Registration failed');
    const data = await response.json();
    return data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_ENDPOINT}?action=users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    return data;
  },
  
  updateUser: async (id: number, userData: UserUpdateData): Promise<User> => {
    const response = await fetch(`${API_ENDPOINT}?action=users&id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to update user');
    const data = await response.json();
    return data;
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    console.log('Password reset requested for:', email);
    return Promise.resolve();
  },
};

export const dashboardAPI = {
  getSummary: async () => {
    const cacheKey = 'dashboard_summary';
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const url = `${API_ENDPOINT}?action=dashboard_summary`;
    console.log('Fetching dashboard summary from:', url);
    
    const response = await fetchWithRetry(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    }, 1);
    
    const data = await response.json();
    setInCache(cacheKey, data);
    return data;
  },

  getRecentTasks: async () => {
    
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const url = `${API_ENDPOINT}?action=recent_tasks`;
    console.log('Fetching recent tasks from:', url);
    
    const response = await fetchWithRetry(url, {
      headers,
    }, 1);
    
    const data = await response.json();
    // Ensure numeric values for hours
    return Array.isArray(data) ? data.map(ensureNumericValues) : [];
  },

  getActiveProjects: async () => {
    
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const url = `${API_ENDPOINT}?action=active_projects`;
    console.log('Fetching active projects from:', url);
    
    const response = await fetchWithRetry(url, {
      headers,
    }, 1);
    
    const data = await response.json();
    return data;
  },

  getCharts: async () => {

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetchWithRetry(`${API_ENDPOINT}?action=dashboard_charts`, {
      headers,
    }, 1);
    
    const data = await response.json();
    
    // Get current month and year for earnings data
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
    
    // Fetch monthly earnings data
    const earningsResponse = await fetch(`${API_ENDPOINT}?action=monthly_earnings&year=${currentYear}&month=${currentMonth}`, {
      headers,
    });
    
    let monthlyEarnings = [];
    if (earningsResponse.ok) {
      monthlyEarnings = await earningsResponse.json();
    }
    
    const transformedData = {
      tasksByStatus: data.tasks_by_status?.map((item: { status: string; count: number }) => ({
        name: item.status,
        value: item.count
      })) || [],
      tasksByProject: data.tasks_by_project?.map((item: { project: string; count: number }) => ({
        name: item.project,
        tasks: item.count
      })) || [],
      upcomingDeadlines: data.upcoming_deadlines || [],
      monthlyEarnings: monthlyEarnings || []
    };
    
    return transformedData;
  },
};

export const financeAPI = {
  getMonthlyEarnings: async (year: number, month: number) => {
    const cacheKey = `monthly_earnings_${year}_${month}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const response = await fetch(`${API_ENDPOINT}?action=monthly_earnings&year=${year}&month=${month}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch monthly earnings');
    const data = await response.json();
    setInCache(cacheKey, data);
    return data;
  },
};

export const apiService = {
  tasks: taskAPI,
  projects: projectAPI,
  clients: clientAPI,
  auth: authAPI,
  dashboard: dashboardAPI,
  finance: financeAPI,
  taskAPI,
  projectAPI,
  clientAPI,
  authAPI,
  dashboardAPI,
  financeAPI,
};

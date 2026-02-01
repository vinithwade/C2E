import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Get API URL - ensure it's always absolute
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use environment variable
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }
  // Server-side: use environment variable
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

const API_URL = getApiUrl();

// Ensure API_URL is absolute (starts with http:// or https://)
const baseURL = API_URL.startsWith('http') ? API_URL : `http://${API_URL}`;

// Log API URL for debugging
if (typeof window !== 'undefined') {
  console.log('API URL:', baseURL);
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    console.log('ApiClient baseURL:', baseURL);
    
    this.client = axios.create({
      baseURL: baseURL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const { data } = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken,
              });
              this.setTokens(data.accessToken, data.refreshToken);
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // Auth endpoints
  async register(email: string, password: string, name?: string) {
    try {
      // Use absolute URL to ensure it goes to the backend
      const fullUrl = `${baseURL}/auth/register`;
      console.log('Registering to:', fullUrl);
      console.log('Base URL:', baseURL);
      console.log('Client baseURL:', this.client.defaults.baseURL);
      
      const { data } = await axios.post(fullUrl, {
      email,
      password,
        name: name || undefined,
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
    });
      
    this.setTokens(data.accessToken, data.refreshToken);
    return data;
    } catch (error: any) {
      console.error('Registration API error:', error);
      console.error('Error URL:', error.config?.url);
      console.error('Error baseURL:', error.config?.baseURL);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', {
      email,
      password,
    });
    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async logout(refreshToken: string) {
    await this.client.post('/auth/logout', { refreshToken });
    this.clearTokens();
  }

  async getMe() {
    const { data } = await this.client.get('/auth/me');
    return data;
  }

  // Project endpoints
  async getProjects() {
    const { data } = await this.client.get('/projects');
    return data;
  }

  async getProject(id: string) {
    const { data } = await this.client.get(`/projects/${id}`);
    return data;
  }

  async createProject(name: string, description?: string) {
    const { data } = await this.client.post('/projects', { name, description });
    return data;
  }

  async updateProject(id: string, updates: { name?: string; description?: string }) {
    const { data } = await this.client.patch(`/projects/${id}`, updates);
    return data;
  }

  async deleteProject(id: string) {
    await this.client.delete(`/projects/${id}`);
  }

  async inviteEditor(projectId: string, email: string, permissions?: any) {
    const { data } = await this.client.post(`/projects/${projectId}/invite`, {
      email,
      ...permissions,
    });
    return data;
  }

  // File endpoints
  async getFiles(projectId: string) {
    const { data } = await this.client.get(`/files/projects/${projectId}`);
    return data;
  }

  async getFileUrl(fileId: string, action: string = 'view') {
    const { data } = await this.client.get(`/files/${fileId}/url`, {
      params: { action },
    });
    return data;
  }

  async createFileMetadata(projectId: string, fileData: any) {
    const { data } = await this.client.post(`/files/projects/${projectId}`, fileData);
    return data;
  }

  async deleteFile(fileId: string) {
    await this.client.delete(`/files/${fileId}`);
  }

  // Storage endpoints
  async getUploadUrl(projectId: string, fileName: string, contentType: string) {
    const { data } = await this.client.post('/storage/upload-url', {
      projectId,
      fileName,
      contentType,
    });
    return data;
  }

  // Invite endpoints
  async acceptInvite(token: string, password?: string, name?: string) {
    const { data } = await this.client.post('/invites/accept', { 
      token,
      password,
      name,
    });
    // If tokens are returned, store them
    if (data.accessToken && data.refreshToken) {
      this.setTokens(data.accessToken, data.refreshToken);
    }
    return data;
  }

  async acceptInviteAuthenticated(token: string) {
    const { data } = await this.client.post('/invites/accept-authenticated', { 
      token,
    });
    return data;
  }
}

export const api = new ApiClient();

import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export interface User {
  id: number
  username: string
  email: string
  bio?: string
  avatarUrl?: string
}

export interface RepairPost {
  id: number
  item_name: string
  issue_description?: string
  repair_steps?: string
  success: boolean
  date: string
  images?: string
  user_id: number
}

export interface Comment {
  id: number
  user_id: number
  repair_post_id: number
  content: string
  parent_id?: number
  date: string
}

export interface Guide {
  id: number
  user_id: number
  item_name: string
  guide_content: string
  date: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/register', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout')
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/auth/me')
    return response.data
  },
}

// Users API
export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/api/users')
    return response.data
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/api/users/${id}`)
    return response.data
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/api/users/me', data)
    return response.data
  },
}

// Repair Posts API
export const repairPostsAPI = {
  getAll: async (): Promise<RepairPost[]> => {
    const response = await api.get('/api/repair-posts')
    return response.data
  },

  getById: async (id: number): Promise<RepairPost> => {
    const response = await api.get(`/api/repair-posts/${id}`)
    return response.data
  },

  create: async (data: Omit<RepairPost, 'id' | 'date' | 'user_id'>): Promise<RepairPost> => {
    const response = await api.post('/api/repair-posts', data)
    return response.data
  },

  update: async (id: number, data: Partial<RepairPost>): Promise<RepairPost> => {
    const response = await api.put(`/api/repair-posts/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/repair-posts/${id}`)
  },
}

// Comments API
export const commentsAPI = {
  getByRepairPost: async (repairPostId: number): Promise<Comment[]> => {
    const response = await api.get(`/api/repair-posts/${repairPostId}/comments`)
    return response.data
  },

  create: async (repairPostId: number, data: { content: string; parent_id?: number }): Promise<Comment> => {
    const response = await api.post(`/api/repair-posts/${repairPostId}/comments`, data)
    return response.data
  },

  update: async (repairPostId: number, commentId: number, data: { content: string }): Promise<Comment> => {
    const response = await api.put(`/api/repair-posts/${repairPostId}/comments/${commentId}`, data)
    return response.data
  },

  delete: async (repairPostId: number, commentId: number): Promise<void> => {
    await api.delete(`/api/repair-posts/${repairPostId}/comments/${commentId}`)
  },
}

// Guides API
export const guidesAPI = {
  getAll: async (): Promise<Guide[]> => {
    const response = await api.get('/api/guides')
    return response.data
  },

  getById: async (id: number): Promise<Guide> => {
    const response = await api.get(`/api/guides/${id}`)
    return response.data
  },

  create: async (data: Omit<Guide, 'id' | 'date' | 'user_id'>): Promise<Guide> => {
    const response = await api.post('/api/guides', data)
    return response.data
  },

  update: async (id: number, data: Partial<Guide>): Promise<Guide> => {
    const response = await api.put(`/api/guides/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/guides/${id}`)
  },
}

export default api

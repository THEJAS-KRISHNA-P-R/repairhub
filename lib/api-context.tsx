"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { authAPI, usersAPI, repairPostsAPI, commentsAPI, guidesAPI, type User, type RepairPost, type Comment, type Guide } from './api'

interface ApiContextType {
  // Auth
  currentUser: User | null
  isInitialized: boolean
  login: (email: string, password: string) => Promise<User>
  register: (email: string, username: string, password: string) => Promise<User>
  logout: () => Promise<void>
  
  // Data
  users: User[]
  repairPosts: RepairPost[]
  comments: Comment[]
  guides: Guide[]
  
  // Actions
  refreshData: () => Promise<void>
  addRepairPost: (data: Omit<RepairPost, 'id' | 'date' | 'user_id'>) => Promise<RepairPost>
  updateRepairPost: (id: number, data: Partial<RepairPost>) => Promise<RepairPost>
  deleteRepairPost: (id: number) => Promise<void>
  addComment: (repairPostId: number, content: string, parentId?: number) => Promise<Comment>
  updateComment: (repairPostId: number, commentId: number, content: string) => Promise<Comment>
  deleteComment: (repairPostId: number, commentId: number) => Promise<void>
  addGuide: (data: Omit<Guide, 'id' | 'date' | 'user_id'>) => Promise<Guide>
  updateGuide: (id: number, data: Partial<Guide>) => Promise<Guide>
  deleteGuide: (id: number) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<User>
}

const ApiContext = createContext<ApiContextType | null>(null)

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [repairPosts, setRepairPosts] = useState<RepairPost[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      authAPI.getCurrentUser()
        .then(setCurrentUser)
        .catch(() => {
          localStorage.removeItem('auth_token')
        })
        .finally(() => {
          setIsInitialized(true)
        })
    } else {
      setIsInitialized(true)
    }
  }, [])

  // Load data when user is authenticated
  useEffect(() => {
    if (currentUser) {
      refreshData()
    }
  }, [currentUser])

  const refreshData = async () => {
    try {
      // Load data individually to handle missing endpoints gracefully
      try {
        const usersData = await usersAPI.getAll()
        setUsers(usersData)
      } catch (error) {
        console.warn('Failed to load users:', error)
      }

      try {
        const repairPostsData = await repairPostsAPI.getAll()
        setRepairPosts(repairPostsData)
      } catch (error) {
        console.warn('Failed to load repair posts:', error)
      }

      try {
        const guidesData = await guidesAPI.getAll()
        setGuides(guidesData)
      } catch (error) {
        console.warn('Failed to load guides:', error)
      }
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await authAPI.login({ email, password })
      localStorage.setItem('auth_token', response.token)
      setCurrentUser(response.user)
      toast({
        title: "Welcome back!",
        description: `Hello, ${response.user.username}`
      })
      return response.user
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed'
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive"
      })
      throw error
    }
  }

  const register = async (email: string, username: string, password: string): Promise<User> => {
    try {
      const response = await authAPI.register({ email, username, password })
      localStorage.setItem('auth_token', response.token)
      setCurrentUser(response.user)
      toast({
        title: "Welcome!",
        description: "Account created successfully"
      })
      return response.user
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed'
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive"
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('auth_token')
      setCurrentUser(null)
      setUsers([])
      setRepairPosts([])
      setComments([])
      setGuides([])
      toast({
        title: "Signed out"
      })
    }
  }

  const addRepairPost = async (data: Omit<RepairPost, 'id' | 'date' | 'user_id'>): Promise<RepairPost> => {
    if (!currentUser) throw new Error('Not authenticated')
    
    const postData = { ...data, user_id: currentUser.id }
    const newPost = await repairPostsAPI.create(postData)
    setRepairPosts(prev => [newPost, ...prev])
    toast({
      title: "Repair posted",
      description: newPost.item_name
    })
    return newPost
  }

  const updateRepairPost = async (id: number, data: Partial<RepairPost>): Promise<RepairPost> => {
    const updatedPost = await repairPostsAPI.update(id, data)
    setRepairPosts(prev => prev.map(post => post.id === id ? updatedPost : post))
    toast({
      title: "Repair updated"
    })
    return updatedPost
  }

  const deleteRepairPost = async (id: number): Promise<void> => {
    await repairPostsAPI.delete(id)
    setRepairPosts(prev => prev.filter(post => post.id !== id))
    toast({
      title: "Repair deleted"
    })
  }

  const addComment = async (repairPostId: number, content: string, parentId?: number): Promise<Comment> => {
    const newComment = await commentsAPI.create(repairPostId, { content, parent_id: parentId })
    setComments(prev => [...prev, newComment])
    toast({
      title: "Comment added"
    })
    return newComment
  }

  const updateComment = async (repairPostId: number, commentId: number, content: string): Promise<Comment> => {
    const updatedComment = await commentsAPI.update(repairPostId, commentId, { content })
    setComments(prev => prev.map(comment => comment.id === commentId ? updatedComment : comment))
    toast({
      title: "Comment updated"
    })
    return updatedComment
  }

  const deleteComment = async (repairPostId: number, commentId: number): Promise<void> => {
    await commentsAPI.delete(repairPostId, commentId)
    setComments(prev => prev.filter(comment => comment.id !== commentId))
    toast({
      title: "Comment deleted"
    })
  }

  const addGuide = async (data: Omit<Guide, 'id' | 'date' | 'user_id'>): Promise<Guide> => {
    if (!currentUser) throw new Error('Not authenticated')
    
    const guideData = { ...data, user_id: currentUser.id }
    const newGuide = await guidesAPI.create(guideData)
    setGuides(prev => [newGuide, ...prev])
    toast({
      title: "Guide published",
      description: newGuide.item_name
    })
    return newGuide
  }

  const updateGuide = async (id: number, data: Partial<Guide>): Promise<Guide> => {
    const updatedGuide = await guidesAPI.update(id, data)
    setGuides(prev => prev.map(guide => guide.id === id ? updatedGuide : guide))
    toast({
      title: "Guide updated"
    })
    return updatedGuide
  }

  const deleteGuide = async (id: number): Promise<void> => {
    await guidesAPI.delete(id)
    setGuides(prev => prev.filter(guide => guide.id !== id))
    toast({
      title: "Guide deleted"
    })
  }

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    const updatedUser = await usersAPI.updateProfile(data)
    setCurrentUser(updatedUser)
    setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user))
    toast({
      title: "Profile updated"
    })
    return updatedUser
  }

  const value: ApiContextType = {
    currentUser,
    isInitialized,
    login,
    register,
    logout,
    users,
    repairPosts,
    comments,
    guides,
    refreshData,
    addRepairPost,
    updateRepairPost,
    deleteRepairPost,
    addComment,
    updateComment,
    deleteComment,
    addGuide,
    updateGuide,
    deleteGuide,
    updateProfile
  }

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  )
}

export function useApi() {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within ApiProvider')
  }
  return context
}

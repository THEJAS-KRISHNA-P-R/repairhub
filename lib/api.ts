
import { createClient } from '@/utils/supabase/client'

// Initialize Supabase client
const supabase = createClient()

export interface User {
  id: string
  username: string
  email: string
  bio?: string
  avatar_url?: string
  is_admin?: boolean
  is_banned?: boolean
}

export interface Category {
  id: string
  name: string
  icon?: string
}

export interface Vote {
  id: string
  user_id: string
  repair_post_id: string
}

export interface Bookmark {
  id: string
  user_id: string
  repair_post_id: string
  created_at?: string
}

export interface RepairPost {
  id: string
  item_name: string
  issue_description?: string
  repair_steps?: string
  success: boolean
  date: string
  images?: string[] | null
  user_id: string
  profiles?: User
  category_id?: string
  category?: Category
  vote_count?: number
  user_has_voted?: boolean
  user_has_bookmarked?: boolean
}

export interface Comment {
  id: string
  user_id: string
  repair_post_id: string
  content: string
  parent_id?: string | null
  date: string
  profiles?: User
}

export interface Guide {
  id: string
  user_id: string
  item_name: string
  guide_content: string
  date: string
  profiles?: User
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
  user: User
  session: any
}

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) throw error

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    return {
      user: profile as User,
      session: authData.session,
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
        },
      },
    })

    if (error) throw error

    return {
      user: {
        id: authData.user!.id,
        email: authData.user!.email!,
        username: data.username,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      },
      session: authData.session
    }
  },

  logout: async (): Promise<void> => {
    await supabase.auth.signOut()
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return profile as User
  },
}

// Users API
export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*')
    if (error) throw error
    return data as User[]
  },

  getById: async (id: string): Promise<User> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (error) throw error
    return data as User
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return profile as User
  },
}

// Repair Posts API
export const repairPostsAPI = {
  getAll: async (searchQuery?: string, categoryId?: string): Promise<RepairPost[]> => {
    let query = supabase
      .from('repair_posts')
      .select(`
        *,
        profiles (*),
        category:categories (*)
      `)
      .order('created_at', { ascending: false })

    if (searchQuery) {
      query = query.or(`item_name.ilike.%${searchQuery}%,issue_description.ilike.%${searchQuery}%`)
    }

    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query
    if (error) throw error

    // Get current user for vote/bookmark status
    const { data: { user } } = await supabase.auth.getUser()

    // Enrich with vote counts and user status
    const enrichedPosts = await Promise.all((data || []).map(async (post: any) => {
      const { count: voteCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('repair_post_id', post.id)

      let userHasVoted = false
      let userHasBookmarked = false

      if (user) {
        const { data: voteData } = await supabase
          .from('votes')
          .select('id')
          .eq('repair_post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle()
        userHasVoted = !!voteData

        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('repair_post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle()
        userHasBookmarked = !!bookmarkData
      }

      return {
        ...post,
        vote_count: voteCount || 0,
        user_has_voted: userHasVoted,
        user_has_bookmarked: userHasBookmarked,
      }
    }))

    return enrichedPosts as RepairPost[]
  },

  getById: async (id: string): Promise<RepairPost> => {
    const { data, error } = await supabase
      .from('repair_posts')
      .select(`
        *,
        profiles (*),
        category:categories (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    // Get vote count
    const { count: voteCount } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('repair_post_id', id)

    // Get user status
    const { data: { user } } = await supabase.auth.getUser()
    let userHasVoted = false
    let userHasBookmarked = false

    if (user) {
      const { data: voteData } = await supabase
        .from('votes')
        .select('id')
        .eq('repair_post_id', id)
        .eq('user_id', user.id)
        .maybeSingle()
      userHasVoted = !!voteData

      const { data: bookmarkData } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('repair_post_id', id)
        .eq('user_id', user.id)
        .maybeSingle()
      userHasBookmarked = !!bookmarkData
    }

    return {
      ...data,
      vote_count: voteCount || 0,
      user_has_voted: userHasVoted,
      user_has_bookmarked: userHasBookmarked,
    } as unknown as RepairPost
  },

  create: async (data: Omit<RepairPost, 'id' | 'date' | 'user_id' | 'profiles'>): Promise<RepairPost> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: post, error } = await supabase
      .from('repair_posts')
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return post as RepairPost
  },

  update: async (id: string, data: Partial<RepairPost>): Promise<RepairPost> => {
    const { data: post, error } = await supabase
      .from('repair_posts')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return post as RepairPost
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('repair_posts').delete().eq('id', id)
    if (error) throw error
  },
}

// Comments API
export const commentsAPI = {
  getByRepairPost: async (repairPostId: string): Promise<Comment[]> => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (*)
      `)
      .eq('repair_post_id', repairPostId)
      .order('date', { ascending: true })

    if (error) throw error
    return data as unknown as Comment[]
  },

  create: async (repairPostId: string, data: { content: string; parent_id?: string }): Promise<Comment> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        content: data.content,
        parent_id: data.parent_id,
        repair_post_id: repairPostId,
        user_id: user.id
      })
      .select(`
        *,
        profiles (*)
      `)
      .single()

    if (error) throw error
    return comment as unknown as Comment
  },

  update: async (repairPostId: string, commentId: string, data: { content: string }): Promise<Comment> => {
    const { data: comment, error } = await supabase
      .from('comments')
      .update({ content: data.content })
      .eq('id', commentId)
      .select(`
            *,
            profiles (*)
        `)
      .single()

    if (error) throw error
    return comment as unknown as Comment
  },

  delete: async (commentId: string): Promise<void> => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) throw error
  }
}

// Guides API
export const guidesAPI = {
  getAll: async (searchQuery?: string): Promise<Guide[]> => {
    let query = supabase
      .from('guides')
      .select(`
        *,
        profiles (*)
      `)
      .order('created_at', { ascending: false })

    if (searchQuery) {
      query = query.or(`item_name.ilike.%${searchQuery}%,guide_content.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data as unknown as Guide[]
  },

  getById: async (id: string): Promise<Guide> => {
    const { data, error } = await supabase
      .from('guides')
      .select(`
        *,
        profiles (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as unknown as Guide
  },

  create: async (data: Omit<Guide, 'id' | 'date' | 'user_id' | 'profiles'>): Promise<Guide> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: guide, error } = await supabase
      .from('guides')
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return guide as Guide
  },

  update: async (id: string, data: Partial<Guide>): Promise<Guide> => {
    const { data: guide, error } = await supabase
      .from('guides')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return guide as Guide
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('guides').delete().eq('id', id)
    if (error) throw error
  },
}

// Categories API
export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (error) throw error
    return data as Category[]
  },

  create: async (data: { name: string; icon?: string }): Promise<Category> => {
    const { data: category, error } = await supabase
      .from('categories')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return category as Category
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const { data: category, error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return category as Category
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
  },
}

// Votes API
export const votesAPI = {
  getCountForPost: async (repairPostId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('repair_post_id', repairPostId)
    if (error) throw error
    return count || 0
  },

  hasUserVoted: async (repairPostId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('repair_post_id', repairPostId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) throw error
    return !!data
  },

  toggle: async (repairPostId: string): Promise<{ voted: boolean; count: number }> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if already voted
    const { data: existing } = await supabase
      .from('votes')
      .select('id')
      .eq('repair_post_id', repairPostId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      // Remove vote
      await supabase.from('votes').delete().eq('id', existing.id)
    } else {
      // Add vote
      await supabase.from('votes').insert({
        repair_post_id: repairPostId,
        user_id: user.id
      })
    }

    const count = await votesAPI.getCountForPost(repairPostId)
    return { voted: !existing, count }
  },
}

// Bookmarks API
export const bookmarksAPI = {
  getAll: async (): Promise<(Bookmark & { repair_post: RepairPost })[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        *,
        repair_post:repair_posts (
          *,
          profiles (*),
          category:categories (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as unknown as (Bookmark & { repair_post: RepairPost })[]
  },

  hasUserBookmarked: async (repairPostId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('repair_post_id', repairPostId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) throw error
    return !!data
  },

  toggle: async (repairPostId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if already bookmarked
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('repair_post_id', repairPostId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      // Remove bookmark
      await supabase.from('bookmarks').delete().eq('id', existing.id)
      return false
    } else {
      // Add bookmark
      await supabase.from('bookmarks').insert({
        repair_post_id: repairPostId,
        user_id: user.id
      })
      return true
    }
  },
}

// Admin API
export const adminAPI = {
  isAdmin: async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (error) return false
    return data?.is_admin === true
  },

  getStats: async (): Promise<{ users: number; posts: number; guides: number; comments: number }> => {
    const [usersRes, postsRes, guidesRes, commentsRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('repair_posts').select('*', { count: 'exact', head: true }),
      supabase.from('guides').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
    ])

    return {
      users: usersRes.count || 0,
      posts: postsRes.count || 0,
      guides: guidesRes.count || 0,
      comments: commentsRes.count || 0,
    }
  },

  getAllPosts: async (): Promise<RepairPost[]> => {
    const { data, error } = await supabase
      .from('repair_posts')
      .select(`
        *,
        profiles (*),
        category:categories (*)
      `)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as unknown as RepairPost[]
  },

  deletePost: async (id: string): Promise<void> => {
    const { error } = await supabase.from('repair_posts').delete().eq('id', id)
    if (error) throw error
  },

  updatePost: async (id: string, data: Partial<RepairPost>): Promise<RepairPost> => {
    const { data: post, error } = await supabase
      .from('repair_posts')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return post as RepairPost
  },

  deleteGuide: async (id: string): Promise<void> => {
    const { error } = await supabase.from('guides').delete().eq('id', id)
    if (error) throw error
  },

  deleteComment: async (id: string): Promise<void> => {
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (error) throw error
  },

  getAllUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as User[]
  },

  toggleBan: async (userId: string, isBanned: boolean): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: isBanned })
      .eq('id', userId)
    if (error) throw error
  },
}

export default supabase


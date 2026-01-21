import { supabase } from './supabase'

/**
 * Admin utility functions for creating rider and admin accounts
 * These should only be called by authenticated admin users
 */

export interface CreateRiderData {
  email: string
  password: string
  full_name: string
  mobile: string
  daily_quota?: number
}

export interface CreateAdminData {
  email: string
  password: string
  full_name: string
  mobile: string
}

/**
 * Create a new rider account
 * Only admins can call this function
 */
export async function createRiderAccount(data: CreateRiderData) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    })

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('Failed to create user account')
    }

    // Create rider profile
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: authData.user.id,
      email: data.email,
      full_name: data.full_name,
      mobile: data.mobile,
      role: 'rider',
      is_active: true,
      daily_quota: data.daily_quota || 10,
      total_deliveries: 0,
      total_earnings: 0,
    })

    if (profileError) {
      // Rollback auth user creation
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Failed to create rider profile: ${profileError.message}`)
    }

    // Add to rider queue
    const { error: queueError } = await supabase.from('rider_queue').insert({
      rider_id: authData.user.id,
      position: 1, // New riders start at position 1
      is_available: true,
    })

    if (queueError) {
      console.warn('Failed to add rider to queue:', queueError.message)
    }

    return {
      success: true,
      riderId: authData.user.id,
      message: 'Rider account created successfully'
    }
  } catch (error) {
    console.error('Create rider account error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create rider account'
    }
  }
}

/**
 * Create a new admin account
 * Only existing admins can call this function
 */
export async function createAdminAccount(data: CreateAdminData) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    })

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('Failed to create user account')
    }

    // Create admin profile
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: authData.user.id,
      email: data.email,
      full_name: data.full_name,
      mobile: data.mobile,
      role: 'admin',
      is_active: true,
    })

    if (profileError) {
      // Rollback auth user creation
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Failed to create admin profile: ${profileError.message}`)
    }

    return {
      success: true,
      adminId: authData.user.id,
      message: 'Admin account created successfully'
    }
  } catch (error) {
    console.error('Create admin account error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create admin account'
    }
  }
}

/**
 * Change user role (admin only)
 * Be careful with this function!
 */
export async function changeUserRole(userId: string, newRole: 'user' | 'rider' | 'admin') {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to change user role: ${error.message}`)
    }

    // If changing to rider, add to rider queue
    if (newRole === 'rider') {
      await supabase.from('rider_queue').upsert({
        rider_id: userId,
        position: 1,
        is_available: true,
      }, {
        onConflict: 'rider_id'
      })
    }

    // If changing from rider, remove from rider queue
    if (newRole !== 'rider') {
      await supabase.from('rider_queue').delete().eq('rider_id', userId)
    }

    return {
      success: true,
      message: `User role changed to ${newRole} successfully`
    }
  } catch (error) {
    console.error('Change user role error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to change user role'
    }
  }
}

/**
 * Toggle rider active status
 */
export async function toggleRiderStatus(riderId: string, isActive: boolean) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('user_id', riderId)
      .eq('role', 'rider')

    if (error) {
      throw new Error(`Failed to update rider status: ${error.message}`)
    }

    // Update rider queue availability
    await supabase
      .from('rider_queue')
      .update({ is_available: isActive })
      .eq('rider_id', riderId)

    return {
      success: true,
      message: `Rider ${isActive ? 'activated' : 'deactivated'} successfully`
    }
  } catch (error) {
    console.error('Toggle rider status error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update rider status'
    }
  }
}

/**
 * Get all users with their roles and status
 */
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        user_id,
        email,
        full_name,
        mobile,
        role,
        is_active,
        created_at,
        updated_at,
        daily_quota,
        total_deliveries,
        total_earnings
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`)
    }

    return {
      success: true,
      users: data || []
    }
  } catch (error) {
    console.error('Get all users error:', error)
    return {
      success: false,
      users: [],
      message: error instanceof Error ? error.message : 'Failed to fetch users'
    }
  }
}

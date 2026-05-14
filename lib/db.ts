import { supabase, getSupabaseAdmin } from './supabaseClient'

// Generic GET function
export async function fetchData<T>(
  table: string,
  filters?: Record<string, unknown>,
  options?: { limit?: number; offset?: number; orderBy?: string }
): Promise<T[]> {
  let query = supabase.from(table).select('*')

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: true })
  }

  const { data, error } = await query

  if (error) {
    console.error(`Error fetching ${table}:`, error)
    throw error
  }

  return data as T[]
}

// Generic GET by ID function
export async function fetchDataById<T>(
  table: string,
  id: string
): Promise<T | null> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error(`Error fetching ${table} with id ${id}:`, error)
    throw error
  }

  return data as T | null
}

// Generic CREATE function
export async function createData<T>(
  table: string,
  payload: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .insert([payload])
    .select()
    .single()

  if (error) {
    console.error(`Error creating ${table}:`, error)
    throw error
  }

  return data as T
}

// Generic UPDATE function
export async function updateData<T>(
  table: string,
  id: string,
  payload: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating ${table}:`, error)
    throw error
  }

  return data as T
}

// Generic DELETE function
export async function deleteData(
  table: string,
  id: string
): Promise<boolean> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`Error deleting ${table}:`, error)
    throw error
  }

  return true
}

// Batch operations for multiple records
export async function fetchMultiple<T>(
  table: string,
  ids: string[]
): Promise<T[]> {
  let query = supabase.from(table).select('*')

  const { data, error } = await query.in('id', ids)

  if (error) {
    console.error(`Error fetching multiple from ${table}:`, error)
    throw error
  }

  return data as T[]
}

// Count records
export async function countRecords(
  table: string,
  filters?: Record<string, unknown>
): Promise<number> {
  let query = supabase.from(table).select('*', { count: 'exact', head: true })

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }

  const { count, error } = await query

  if (error) {
    console.error(`Error counting ${table}:`, error)
    throw error
  }

  return count || 0
}

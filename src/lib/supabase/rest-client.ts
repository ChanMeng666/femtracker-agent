// Simple REST API wrapper for Supabase since the JS client is having timeout issues
class SupabaseRestClient {
  private baseUrl: string
  private apiKey: string

  constructor(url: string, key: string) {
    this.baseUrl = url
    this.apiKey = key
  }

  private async request(endpoint: string, options: RequestInit = {}, accessToken?: string) {
    const url = `${this.baseUrl}/rest/v1/${endpoint}`
    
    const headers = {
      'apikey': this.apiKey,
      'Authorization': `Bearer ${accessToken || this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return response
  }

  async select(table: string, columns = '*', filters: Record<string, unknown> = {}, options: { limit?: number; accessToken?: string } = {}) {
    let endpoint = `${table}?select=${columns}`
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      endpoint += `&${key}=eq.${value}`
    })
    
    // Add limit
    if (options.limit) {
      endpoint += `&limit=${options.limit}`
    }

    const response = await this.request(endpoint, {}, options.accessToken)
    const data = await response.json()
    
    return {
      data,
      error: null,
      status: response.status
    }
  }

  async count(table: string, filters: Record<string, unknown> = {}, accessToken?: string) {
    let endpoint = `${table}?select=count`
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      endpoint += `&${key}=eq.${value}`
    })

    const response = await this.request(endpoint, {
      headers: {
        'Prefer': 'count=exact'
      }
    }, accessToken)
    
    const data = await response.json()
    const countHeader = response.headers.get('content-range')
    const count = countHeader ? parseInt(countHeader.split('/')[1]) : data.length
    
    return {
      data: [{ count }],
      error: null,
      status: response.status,
      count
    }
  }

  async insert(table: string, data: unknown, accessToken?: string) {
    const response = await this.request(table, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Prefer': 'return=representation'
      }
    }, accessToken)

    const responseData = await response.json()
    
    return {
      data: responseData,
      error: null,
      status: response.status
    }
  }

  async update(table: string, data: unknown, filters: Record<string, unknown>, accessToken?: string) {
    let endpoint = `${table}?`
    
    // Add filters
    Object.entries(filters).forEach(([key, value], index) => {
      if (index > 0) endpoint += '&'
      endpoint += `${key}=eq.${value}`
    })

    const response = await this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Prefer': 'return=representation'
      }
    }, accessToken)

    const responseData = await response.json()
    
    return {
      data: responseData,
      error: null,
      status: response.status
    }
  }

  async delete(table: string, filters: Record<string, unknown>, accessToken?: string) {
    let endpoint = `${table}?`
    
    // Add filters
    Object.entries(filters).forEach(([key, value], index) => {
      if (index > 0) endpoint += '&'
      endpoint += `${key}=eq.${value}`
    })

    const response = await this.request(endpoint, {
      method: 'DELETE'
    }, accessToken)

    return {
      data: null,
      error: null,
      status: response.status
    }
  }
}

// Create the REST client instance
export const supabaseRest = new SupabaseRestClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Helper functions that mimic Supabase client API
export const createRestQuery = (table: string) => ({
  select: (columns = '*') => ({
    eq: (column: string, value: unknown) => ({
      limit: (count: number) => supabaseRest.select(table, columns, { [column]: value }, { limit: count }),
      single: () => supabaseRest.select(table, columns, { [column]: value }, { limit: 1 }).then(result => ({
        ...result,
        data: result.data?.[0] || null
      }))
    }),
    limit: (count: number) => supabaseRest.select(table, columns, {}, { limit: count })
  }),
  count: () => supabaseRest.count(table),
  insert: (data: unknown) => supabaseRest.insert(table, data),
  update: (data: unknown) => ({
    eq: (column: string, value: unknown) => supabaseRest.update(table, data, { [column]: value })
  })
})

// Type definitions for common database entities
export interface Profile {
  id: string;
  display_name?: string;
  date_of_birth?: string;
  height_cm?: number;
  cycle_length?: number;
  period_length?: number;
  timezone?: string;
  created_at: string;
  updated_at: string;
  age?: number;
}

export interface HealthOverview {
  id: string;
  user_id: string;
  overall_score: number;
  cycle_health: number;
  nutrition_score: number;
  exercise_score: number;
  fertility_score: number;
  lifestyle_score: number;
  symptoms_score: number;
  last_updated: string;
  created_at: string;
} 
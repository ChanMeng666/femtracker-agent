// REST API客户端包装器，用于替代Supabase JavaScript客户端
// 支持Bearer token认证和标准CRUD操作

interface InsertOptions {
  select?: string;
  single?: boolean;
}

interface UpdateOptions {
  select?: string;
}

interface QueryData {
  [key: string]: unknown;
}

class TableQuery {
  constructor(
    private table: string,
    private baseUrl: string,
    private getAuthHeaders: () => Promise<HeadersInit>
  ) {}

  select(columns?: string) {
    const query = new QueryBuilder(this.table, this.baseUrl, this.getAuthHeaders, 'select');
    if (columns) {
      query.selectColumns = columns;
    }
    return query;
  }

  async insert(data: Record<string, unknown>[], options?: InsertOptions) {
    const headers = await this.getAuthHeaders();
    const url = `${this.baseUrl}/rest/v1/${this.table}`;
    
    const requestHeaders: Record<string, string> = {
      ...headers,
      'Content-Type': 'application/json',
      'Prefer': options?.single ? 'return=representation,resolution=merge-duplicates' : 'return=representation'
    } as Record<string, string>;

    if (options?.select) {
      requestHeaders['Prefer'] += `,columns=${options.select}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.text();
      return { data: null, error: { message: error, status: response.status } };
    }

    const result = await response.json();
    return { 
      data: options?.single ? result[0] : result, 
      error: null 
    };
  }

  update(data: QueryData, options?: UpdateOptions) {
    return new QueryBuilder(this.table, this.baseUrl, this.getAuthHeaders, 'update', data, options);
  }

  delete() {
    return new QueryBuilder(this.table, this.baseUrl, this.getAuthHeaders, 'delete');
  }

  async upsert(data: QueryData[], options?: InsertOptions) {
    const headers = await this.getAuthHeaders();
    const url = `${this.baseUrl}/rest/v1/${this.table}`;
    
    const requestHeaders: Record<string, string> = {
      ...headers as Record<string, string>,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation,resolution=merge-duplicates'
    };

    if (options?.select) {
      requestHeaders['Prefer'] += `,columns=${options.select}`;
    }

    console.log('Upsert request details:', {
      url,
      method: 'POST',
      headers: requestHeaders,
      data: data
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(data)
    });

    console.log('Upsert response status:', response.status);
    console.log('Upsert response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const error = await response.text();
      console.error('Upsert failed with error:', {
        status: response.status,
        statusText: response.statusText,
        error: error
      });
      
      let parsedError;
      try {
        parsedError = JSON.parse(error);
      } catch {
        parsedError = { message: error };
      }
      
      return { data: null, error: { message: parsedError.message || error, status: response.status, details: parsedError } };
    }

    const result = await response.json();
    console.log('Upsert successful result:', result);
    return { 
      data: options?.single ? result[0] : result, 
      error: null 
    };
  }

  // Add a manual upsert method that handles conflicts properly
  async manualUpsert(data: QueryData[], conflictColumns: string[], options?: InsertOptions) {
    const headers = await this.getAuthHeaders();
    const url = `${this.baseUrl}/rest/v1/${this.table}`;
    
    const requestHeaders: Record<string, string> = {
      ...headers as Record<string, string>,
      'Content-Type': 'application/json',
      'Prefer': `return=representation,resolution=merge-duplicates,on_conflict=${conflictColumns.join(',')}`
    };

    if (options?.select) {
      requestHeaders['Prefer'] += `,columns=${options.select}`;
    }

    console.log('Manual upsert request details:', {
      url,
      method: 'POST',
      headers: requestHeaders,
      data: data,
      conflictColumns
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(data)
    });

    console.log('Manual upsert response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Manual upsert failed:', {
        status: response.status,
        error: error
      });
      
      let parsedError;
      try {
        parsedError = JSON.parse(error);
      } catch {
        parsedError = { message: error };
      }
      
      return { data: null, error: { message: parsedError.message || error, status: response.status, details: parsedError } };
    }

    const result = await response.json();
    console.log('Manual upsert successful result:', result);
    return { 
      data: options?.single ? result[0] : result, 
      error: null 
    };
  }
}

class QueryBuilder {
  public selectColumns?: string;
  private conditions: string[] = [];
  private orderBy?: string;
  private limitCount?: number;
  private returnSingle = false;

  constructor(
    private table: string,
    private baseUrl: string,
    private getAuthHeaders: () => Promise<HeadersInit>,
    private operation: 'select' | 'update' | 'delete',
    private updateData?: QueryData,
    private updateOptions?: UpdateOptions
  ) {}

  eq(column: string, value: unknown) {
    this.conditions.push(`${column}=eq.${encodeURIComponent(String(value))}`);
    return this;
  }

  gte(column: string, value: unknown) {
    this.conditions.push(`${column}=gte.${encodeURIComponent(String(value))}`);
    return this;
  }

  lte(column: string, value: unknown) {
    this.conditions.push(`${column}=lte.${encodeURIComponent(String(value))}`);
    return this;
  }

  lt(column: string, value: unknown) {
    this.conditions.push(`${column}=lt.${encodeURIComponent(String(value))}`);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const direction = options?.ascending === false ? 'desc' : 'asc';
    this.orderBy = `order=${column}.${direction}`;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.returnSingle = true;
    return this;
  }

  async execute(): Promise<{ data: unknown; error: unknown }> {
    const headers = await this.getAuthHeaders();
    let url = `${this.baseUrl}/rest/v1/${this.table}`;

    // Build query parameters
    const params: string[] = [];
    
    // For select operations, handle column selection
    if (this.operation === 'select' && this.selectColumns) {
      params.push(`select=${encodeURIComponent(this.selectColumns)}`);
    }
    
    // Add conditions
    if (this.conditions.length > 0) {
      params.push(...this.conditions);
    }
    
    // Add ordering
    if (this.orderBy) {
      params.push(this.orderBy);
    }
    
    // Add limit
    if (this.limitCount) {
      params.push(`limit=${this.limitCount}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    const requestHeaders: HeadersInit = { ...headers };

    let method = 'GET';
    let body: string | undefined;

    if (this.operation === 'update') {
      method = 'PATCH';
      requestHeaders['Content-Type'] = 'application/json';
      requestHeaders['Prefer'] = 'return=representation';
      if (this.updateOptions?.select) {
        requestHeaders['Prefer'] += `,columns=${this.updateOptions.select}`;
      }
      body = JSON.stringify(this.updateData);
    } else if (this.operation === 'delete') {
      method = 'DELETE';
      requestHeaders['Prefer'] = 'return=representation';
    } else if (this.returnSingle) {
      requestHeaders['Accept'] = 'application/vnd.pgrst.object+json';
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.hint || errorText;
        } catch {
          // Keep original error text if not JSON
        }

        // Handle specific error codes
        if (response.status === 406 && this.returnSingle) {
          return { data: null, error: { message: 'No rows returned', code: 'PGRST116' } };
        }

        return { 
          data: null, 
          error: { 
            message: errorMessage, 
            status: response.status,
            code: response.status === 406 ? 'PGRST116' : undefined
          } 
        };
      }

      const result = await response.json();
      return { data: result, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: { 
          message: err instanceof Error ? err.message : 'Network error',
          code: 'NETWORK_ERROR'
        } 
      };
    }
  }

  // For compatibility with existing code, add then method
  then<TResult1 = { data: unknown; error: unknown }, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown; error: unknown }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class AuthClient {
  constructor(private baseUrl: string, private anonKey: string) {}

  async getSession(): Promise<{ data: { session: unknown }; error: unknown }> {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) {
        return { data: { session: null }, error: null };
      }

      const tokenData = JSON.parse(token);
      const now = Date.now() / 1000;
      
      if (tokenData.expires_at && tokenData.expires_at < now) {
        localStorage.removeItem('supabase.auth.token');
        return { data: { session: null }, error: null };
      }

      // 验证token是否仍然有效
      const response = await fetch(`${this.baseUrl}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'apikey': this.anonKey
        }
      });

      if (!response.ok) {
        localStorage.removeItem('supabase.auth.token');
        return { data: { session: null }, error: null };
      }

      const user = await response.json();
      return { 
        data: { 
          session: {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: tokenData.expires_at,
            user
          }
        }, 
        error: null 
      };
    } catch (err) {
      return { 
        data: { session: null }, 
        error: { message: err instanceof Error ? err.message : 'Auth error' } 
      };
    }
  }

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    // 初始检查
    this.getSession().then(({ data: { session } }) => {
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    });

    // 监听storage变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase.auth.token') {
        this.getSession().then(({ data: { session } }) => {
          callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            window.removeEventListener('storage', handleStorageChange);
          }
        }
      }
    };
  }

  async signInWithPassword(credentials: { email: string; password: string }) {
    try {
      console.log('REST Client: Starting signInWithPassword');
      console.log('BASE URL:', this.baseUrl);
      console.log('API KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
      
      const response = await fetch(`${this.baseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.anonKey
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      console.log('REST Client: Response status:', response.status);
      console.log('REST Client: Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('REST Client: Error response:', errorText);
        try {
          const error = JSON.parse(errorText);
          return { data: null, error };
        } catch {
          return { data: null, error: { message: errorText, status: response.status } };
        }
      }

      const result = await response.json();
      console.log('REST Client: Login success, received data:', {
        hasAccessToken: !!result.access_token,
        hasRefreshToken: !!result.refresh_token,
        expiresAt: result.expires_at,
        userEmail: result.user?.email
      });
      
      // 保存token到localStorage
      const tokenData = {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_at: result.expires_at
      };
      
      localStorage.setItem('supabase.auth.token', JSON.stringify(tokenData));
      console.log('REST Client: Token saved to localStorage');

      // 触发storage事件以更新认证状态
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'supabase.auth.token',
        newValue: JSON.stringify(tokenData)
      }));

      return { data: result, error: null };
    } catch (err) {
      console.error('REST Client: Unexpected error:', err);
      return { 
        data: null, 
        error: { message: err instanceof Error ? err.message : 'Sign in error' } 
      };
    }
  }

  async signUp(credentials: { email: string; password: string; options?: Record<string, unknown> }) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          data: credentials.options?.data || {}
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      const result = await response.json();
      
      if (result.access_token) {
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          expires_at: result.expires_at
        }));
      }

      return { data: result, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: { message: err instanceof Error ? err.message : 'Sign up error' } 
      };
    }
  }

  async signOut() {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      if (token) {
        const tokenData = JSON.parse(token);
        
        await fetch(`${this.baseUrl}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          }
        });
        
        localStorage.removeItem('supabase.auth.token');
      }

      return { error: null };
    } catch (err) {
      localStorage.removeItem('supabase.auth.token');
      return { 
        error: { message: err instanceof Error ? err.message : 'Sign out error' } 
      };
    }
  }

  async resetPasswordForEmail(email: string, options?: { redirectTo?: string }) {
    try {
      const body: Record<string, unknown> = { email };
      if (options?.redirectTo) {
        body.redirect_to = options.redirectTo;
      }

      const response = await fetch(`${this.baseUrl}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      return { data: {}, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: { message: err instanceof Error ? err.message : 'Password reset error' } 
      };
    }
  }

  async updateUser(updates: { password?: string; data?: Record<string, unknown> }) {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) {
        return { data: null, error: { message: 'No authentication token found' } };
      }

      const tokenData = JSON.parse(token);
      const response = await fetch(`${this.baseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.access_token}`,
          'apikey': this.anonKey
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      const result = await response.json();
      return { data: result, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: { message: err instanceof Error ? err.message : 'Update user error' } 
      };
    }
  }
}

export class SupabaseRestClient {
  private baseUrl: string;
  private anonKey: string;

  constructor() {
    // 确保环境变量在客户端正确加载
    if (typeof window !== 'undefined') {
      this.baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      this.anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    } else {
      // 服务端渲染时的默认值
      this.baseUrl = '';
      this.anonKey = '';
    }
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('supabase.auth.token') : null;
    const headers: HeadersInit = {
      'apikey': this.anonKey,
      'Content-Profile': 'public'
    };

    if (token) {
      try {
        const tokenData = JSON.parse(token);
        headers['Authorization'] = `Bearer ${tokenData.access_token}`;
      } catch {
        // 如果token无效，只使用匿名key
      }
    }

    return headers;
  }

  from(table: string) {
    return new TableQuery(table, this.baseUrl, () => this.getAuthHeaders());
  }

  get auth() {
    return new AuthClient(this.baseUrl, this.anonKey);
  }
}

// 创建单例实例
export const supabaseRest = new SupabaseRestClient(); 
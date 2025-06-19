// 简化的认证测试客户端
// 用于诊断登录问题

export class SimpleAuthClient {
  private baseUrl: string;
  private anonKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    this.anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    console.log('SimpleAuth: Initialized with:', {
      hasBaseUrl: !!this.baseUrl,
      hasAnonKey: !!this.anonKey,
      baseUrl: this.baseUrl
    });
  }

  async testLogin(email: string, password: string) {
    console.log('SimpleAuth: Testing login for:', email);
    
    try {
      const url = `${this.baseUrl}/auth/v1/token?grant_type=password`;
      console.log('SimpleAuth: Request URL:', url);
      
      const requestBody = {
        email: email,
        password: password
      };
      
      console.log('SimpleAuth: Request body:', requestBody);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.anonKey
        },
        body: JSON.stringify(requestBody)
      });

      console.log('SimpleAuth: Response status:', response.status);
      console.log('SimpleAuth: Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('SimpleAuth: Response text:', responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log('SimpleAuth: Success data:', {
          hasAccessToken: !!data.access_token,
          hasUser: !!data.user,
          userEmail: data.user?.email
        });
        return { success: true, data };
      } else {
        console.error('SimpleAuth: Error response:', responseText);
        return { success: false, error: responseText };
      }
    } catch (error) {
      console.error('SimpleAuth: Exception:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async testEnvironment() {
    console.log('SimpleAuth: Environment test');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
    
    if (typeof window !== 'undefined') {
      console.log('Running in browser');
    } else {
      console.log('Running on server');
    }
  }
}

export const simpleAuth = new SimpleAuthClient(); 
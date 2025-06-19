'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleAuthCallback = () => {
      if (typeof window === 'undefined') return;

      console.log('AuthCallback: Processing callback');
      console.log('AuthCallback: Current URL:', window.location.href);
      console.log('AuthCallback: Hash:', window.location.hash);

      const hash = window.location.hash.substring(1);
      if (!hash) {
        console.log('AuthCallback: No hash found, redirecting to login');
        setStatus('No authentication data found. Redirecting to login...');
        setTimeout(() => router.replace('/'), 2000);
        return;
      }

      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');
      const type = hashParams.get('type');

      console.log('AuthCallback: Parsed params:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        error,
        errorDescription,
        type
      });

      // 处理错误情况
      if (error) {
        if (error === 'access_denied' && errorDescription?.includes('expired')) {
          setStatus('Password reset link has expired. Redirecting to reset request page...');
          setTimeout(() => router.replace('/auth/forgot-password'), 3000);
        } else {
          setStatus(`Authentication error: ${decodeURIComponent(errorDescription || error)}`);
          setTimeout(() => router.replace('/auth/forgot-password'), 5000);
        }
        return;
      }

      // 处理成功的密码重置token
      if ((accessToken || refreshToken) && (type === 'recovery' || type === 'signup')) {
        console.log('AuthCallback: Valid reset token found, redirecting to reset page');
        setStatus('Valid reset link found. Redirecting to password reset page...');
        
        // 保存token用于密码重置
        if (accessToken) {
          localStorage.setItem('supabase.auth.token', JSON.stringify({
            access_token: accessToken,
            refresh_token: refreshToken || '',
            expires_at: Date.now() / 1000 + 3600 // 1小时后过期
          }));
        }
        
        setTimeout(() => router.replace('/auth/reset-password'), 1000);
        return;
      }

      // 处理普通登录token
      if (accessToken) {
        console.log('AuthCallback: Login token found, saving and redirecting to dashboard');
        setStatus('Login successful. Redirecting to dashboard...');
        
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken || '',
          expires_at: Date.now() / 1000 + 3600
        }));
        
        // 触发storage事件以更新认证状态
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'supabase.auth.token',
          newValue: localStorage.getItem('supabase.auth.token')
        }));
        
        setTimeout(() => router.replace('/'), 1000);
        return;
      }

      // 如果到这里，说明有未知的hash参数
      setStatus('Unknown authentication data. Redirecting to login...');
      setTimeout(() => router.replace('/'), 3000);
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing Authentication</h1>
        <p className="text-gray-600 mb-6">{status}</p>
        
        <div className="text-sm text-gray-500">
          <p>Please wait while we process your authentication request...</p>
        </div>
      </div>
    </div>
  );
} 
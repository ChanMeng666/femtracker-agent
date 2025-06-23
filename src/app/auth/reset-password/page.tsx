'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updatePassword } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 检查URL hash中的参数（Supabase使用hash fragments）
    const handleHashParams = () => {
      if (typeof window === 'undefined') return;
      
      const hash = window.location.hash.substring(1); // 移除#号
      const hashParams = new URLSearchParams(hash);
      
      const errorParam = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      console.log('ResetPassword: Hash params:', {
        error: errorParam,
        errorDescription,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken
      });
      
      if (errorParam) {
        if (errorParam === 'access_denied' && errorDescription?.includes('expired')) {
          setError('Password reset link has expired. Please request a new reset link.');
        } else {
          setError(`Reset error: ${decodeURIComponent(errorDescription || errorParam)}`);
        }
      } else if (accessToken) {
        // 如果有access token，说明链接有效，可以重置密码
        console.log('ResetPassword: Valid reset token found');
        // 保存token以供密码重置使用
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken || '',
          expires_at: Date.now() / 1000 + 3600 // 1小时后过期
        }));
      }
    };

    // 检查搜索参数（兜底）
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (errorParam) {
      if (errorParam === 'access_denied' && errorDescription?.includes('expired')) {
        setError('Password reset link has expired. Please request a new reset link.');
      } else {
        setError(`Reset error: ${errorDescription || errorParam}`);
      }
    } else {
      // 如果搜索参数没有错误，检查hash
      handleHashParams();
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证输入
    if (!password.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    console.log('ResetPassword: Starting password update');

    try {
      const { error: updateError } = await updatePassword(password);
      
      if (updateError) {
        console.error('ResetPassword: Update error:', updateError);
        setError(`Failed to update password: ${updateError.message}`);
      } else {
        console.log('ResetPassword: Password updated successfully');
        setSuccess(true);
        // 3秒后跳转到登录页面
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (err) {
      console.error('ResetPassword: Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewLink = () => {
    router.push('/auth/forgot-password');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Password Updated!</h1>
          <p className="text-gray-600 mb-6">
            Your password has been successfully updated. You will be redirected to the login page shortly.
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Lock className="w-12 h-12 text-pink-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 text-sm">{error}</p>
                {error.includes('expired') && (
                  <button
                    onClick={handleRequestNewLink}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline decoration-red-600 underline-offset-2 hover:decoration-red-800 transition-colors"
                  >
                    Request a new reset link
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter your new password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Confirm your new password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white py-3 px-4 rounded-xl hover:bg-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating Password...
              </div>
            ) : (
              'Update Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline decoration-gray-500 underline-offset-2 hover:decoration-gray-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
} 
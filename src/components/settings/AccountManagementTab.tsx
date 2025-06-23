import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
// import { simpleAuth } from '@/lib/supabase/authTest';
import { LogOut, User, Key, TestTube, AlertCircle, CheckCircle } from 'lucide-react';

export const AccountManagementTab: React.FC = () => {
  const { user, signOut, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState(user?.email || '');
  const [resetMessage, setResetMessage] = useState('');

  const handleSignOut = async () => {
    setLoading(true);
    try {
      console.log('AccountManagement: Starting sign out');
      const { error } = await signOut();
      if (error) {
        console.error('AccountManagement: Sign out error:', error);
        setTestResult(`Sign out failed: ${error.message}`);
      } else {
        console.log('AccountManagement: Sign out successful');
        setTestResult('Sign out successful! Redirecting to login...');
        
        // 清除localStorage中的认证状态
        localStorage.removeItem('supabase.auth.token');
        
        // 等待一秒让用户看到成功消息，然后跳转
        setTimeout(() => {
          // 强制跳转到登录页面并刷新页面
          window.location.href = '/';
        }, 1000);
      }
    } catch (err) {
      console.error('AccountManagement: Unexpected error during sign out:', err);
      setTestResult('Unexpected error during sign out');
    } finally {
      setLoading(false);
    }
  };

  // 注释掉环境测试功能
  // const handleTestEnvironment = async () => {
  //   setLoading(true);
  //   setTestResult('Running environment tests...');
  //   try {
  //     console.log('=== ACCOUNT MANAGEMENT: ENVIRONMENT TEST ===');
  //     simpleAuth.testEnvironment();
  //     setTestResult('Environment test completed. Check console for details.');
  //   } catch (error) {
  //     console.error('Environment test error:', error);
  //     setTestResult('Environment test failed');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setResetMessage('');
    try {
      const { error } = await resetPassword(resetEmail);
      if (error) {
        setResetMessage(`Reset failed: ${error.message}`);
      } else {
        setResetMessage('Password reset email sent! Check your email inbox.');
        setShowResetForm(false);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setResetMessage('Unexpected error during password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <User className="w-5 h-5" />
        Account Management
      </h2>

      <div className="space-y-6">
        {/* Current User Info */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Currently Logged In
          </h3>
          <div className="space-y-1 text-sm">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>User ID:</strong> {user?.id}</p>
            <p><strong>Created:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className={`p-4 rounded-xl border ${
            testResult.includes('failed') || testResult.includes('error') 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{testResult}</p>
            </div>
          </div>
        )}

        {/* Account Actions */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-800 mb-3">Account Actions</h3>
          
          {/* Sign Out */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Sign out of your account to test the login functionality
                </p>
              </div>
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {loading ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          </div>

          {/* Password Reset */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Reset Password
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Send a password reset email to your account
                </p>
              </div>
              <button
                onClick={() => setShowResetForm(!showResetForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {showResetForm ? 'Cancel' : 'Reset Password'}
              </button>
            </div>

            {showResetForm && (
              <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
                {resetMessage && (
                  <p className={`text-sm ${
                    resetMessage.includes('failed') || resetMessage.includes('error')
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {resetMessage}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 注释掉Environment Test */}
          {/* 
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  Environment Test
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Test environment variables and API connectivity
                </p>
              </div>
              <button
                onClick={handleTestEnvironment}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {loading ? 'Testing...' : 'Run Test'}
              </button>
            </div>
          </div>
          */}
        </div>

        {/* Instructions */}
        {/* <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <h3 className="font-medium text-yellow-800 mb-2">🧪 How to Test Authentication</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Click &quot;Sign Out&quot; to log out of your account</li>
            <li>2. You&apos;ll be redirected to the login page</li>
            <li>3. Test login with your existing credentials</li>
            <li>4. Test registration by creating a new account</li>
            <li>5. Test password reset functionality</li>
          </ol>
        </div> */}

        {/* Debug Information */}
        {/* <div className="p-4 bg-gray-100 rounded-xl">
          <h3 className="font-medium text-gray-800 mb-2">🔧 Debug Information</h3>
          <div className="text-xs text-gray-600 font-mono space-y-1">
            <p>Auth Status: {user ? 'Authenticated' : 'Not Authenticated'}</p>
            <p>User ID: {user?.id || 'N/A'}</p>
            <p>Browser: {typeof window !== 'undefined' ? 'Client' : 'Server'}</p>
            <p>Local Storage Token: {typeof window !== 'undefined' && localStorage.getItem('supabase.auth.token') ? 'Present' : 'Missing'}</p>
          </div>
        </div> */}
      </div>
    </div>
  );
}; 
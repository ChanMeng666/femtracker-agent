'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/auth/useAuth'
import { simpleAuth } from '@/lib/supabase/authTest'

export default function LoginForm() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    console.log('LoginForm: Submitting form', { email, isSignUp });

    const result = isSignUp 
      ? await signUp(email, password, fullName)
      : await signIn(email, password)

    console.log('LoginForm: Auth result:', {
      hasData: !!result.data,
      hasError: !!result.error,
      errorMessage: result.error?.message
    });

    if (result.error) {
      setMessage(result.error.message || 'Authentication failed')
      console.error('LoginForm: Authentication error:', result.error);
    } else if (isSignUp) {
      setMessage('Please check your email to confirm your account!')
    } else {
      console.log('LoginForm: Login successful');
      setMessage('Login successful! Redirecting...')
    }

    setLoading(false)
  }

  const handleTestAuth = async () => {
    console.log('=== STARTING AUTH TEST ===');
    simpleAuth.testEnvironment();
    
    if (email && password) {
      const result = await simpleAuth.testLogin(email, password);
      setMessage(`Test result: ${result.success ? 'SUCCESS' : 'FAILED: ' + result.error}`);
    } else {
      setMessage('Please enter email and password for test');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🌸 FemTracker
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-gray-600">
            {isSignUp 
              ? 'Join thousands of women tracking their health journey'
              : 'Sign in to access your health dashboard'
            }
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {isSignUp && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                required={isSignUp}
              />
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
              required
              minLength={6}
            />
            {isSignUp && (
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            )}
          </div>
          
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('Error') || message.includes('error')
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
              {message}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
          
          {/* Debug Test Button */}
          <button
            type="button"
            onClick={handleTestAuth}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
          >
            🔧 Test Auth (Debug)
          </button>
          
          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage('')
                setFullName('')
                setEmail('')
                setPassword('')
              }}
              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : 'Need an account? Sign Up'
              }
            </button>
            
            {!isSignUp && (
              <div>
                <a
                  href="/auth/forgot-password"
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Forgot your password?
                </a>
              </div>
            )}
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            Your health data is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  )
} 
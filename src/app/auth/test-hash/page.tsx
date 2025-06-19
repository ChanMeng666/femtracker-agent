'use client';

import { useEffect, useState } from 'react';

export default function TestHashPage() {
  const [hashParams, setHashParams] = useState<Record<string, string>>({});
  const [rawHash, setRawHash] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.substring(1);
      setRawHash(hash);
      
      if (hash) {
        const params = new URLSearchParams(hash);
        const paramObj: Record<string, string> = {};
        params.forEach((value, key) => {
          paramObj[key] = value;
        });
        setHashParams(paramObj);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Hash Parameter Test</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Raw Hash:</h2>
            <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded font-mono break-all">
              {rawHash || 'No hash found'}
            </p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Parsed Parameters:</h2>
            <div className="space-y-2">
              {Object.keys(hashParams).length > 0 ? (
                Object.entries(hashParams).map(([key, value]) => (
                  <div key={key} className="bg-gray-100 p-2 rounded">
                    <span className="font-semibold">{key}:</span> {decodeURIComponent(value)}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No parameters found</p>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Test URLs:</h2>
            <div className="space-y-1 text-sm">
              <p>
                <strong>With error:</strong><br/>
                <code className="text-xs bg-gray-100 p-1 rounded">
                  /auth/test-hash#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
                </code>
              </p>
              <p>
                <strong>With tokens:</strong><br/>
                <code className="text-xs bg-gray-100 p-1 rounded">
                  /auth/test-hash#access_token=test123&refresh_token=refresh456&type=recovery
                </code>
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
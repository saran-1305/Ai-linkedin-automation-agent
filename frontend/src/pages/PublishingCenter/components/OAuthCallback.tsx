import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { publishingApi } from '../../../services/api/publishingApi';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    // In a real app, the platform name might be passed in state or via path parameter
    // For simplicity, we assume we can infer it, or we pass it in state e.g. "state_linkedin"
    // If not, we'd need a separate callback route for each, or pass it explicitly.
    // Let's assume the backend will validate the state and it knows which platform it is.
    // Wait, the API requires `platform_name`. Let's get it from localStorage for now.
    const platformName = localStorage.getItem('oauth_platform_name');

    if (!code || !state || !platformName) {
      setStatus('error');
      setErrorMsg('Missing authorization code, state, or platform name.');
      return;
    }

    publishingApi.connectPlatform(platformName, code, state)
      .then(() => {
        setStatus('success');
        localStorage.removeItem('oauth_platform_name');
        setTimeout(() => navigate('/publishing-assistant'), 2000);
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err.response?.data?.detail || 'Failed to connect platform.');
      });
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Connecting Account...</h2>
            <p className="text-slate-400 text-sm">Please wait while we secure your connection.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Successfully Connected!</h2>
            <p className="text-slate-400 text-sm mb-6">Your platform account is now linked.</p>
            <button 
              onClick={() => navigate('/publishing-assistant')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium w-full"
            >
              Return to Publishing Center
            </button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Connection Failed</h2>
            <p className="text-red-400 text-sm mb-6">{errorMsg}</p>
            <button 
              onClick={() => navigate('/publishing-assistant')}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium w-full"
            >
              Back to Publishing Center
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;

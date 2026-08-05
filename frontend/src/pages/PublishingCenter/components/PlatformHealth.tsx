import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { publishingApi } from '../../../services/api/publishingApi';

export const PlatformHealth = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publishingApi.getPlatformAccounts().then(res => {
      setAccounts(res.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleReconnect = async (platform: string) => {
    try {
      const res = await publishingApi.getAuthUrl(platform);
      if (res.data?.url) {
        localStorage.setItem('oauth_platform_name', platform);
        window.location.href = res.data.url;
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-indigo-400" />
        Platform Health
      </h3>
      
      <div className="space-y-4">
        {loading ? (
          <div className="text-sm text-slate-400 text-center py-4">Checking connections...</div>
        ) : accounts.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-4">No platforms connected yet.</div>
        ) : accounts.map(account => {
          const isConnected = account.is_connected;
          const hasUrn = !!account.platform_user_id;
          const isHealthy = isConnected && hasUrn;

          return (
            <div key={account.id} className={`bg-slate-900 border border-slate-700 p-4 rounded-lg ${!isHealthy ? 'border-l-4 border-l-red-500' : ''}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-white text-sm">{account.platform_name}</span>
                {isHealthy ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded">
                    <CheckCircle className="w-3 h-3" /> Connected
                  </span>
                ) : isConnected && !hasUrn ? (
                  <span className="flex items-center gap-1 text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" /> Token Expired
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-400 font-medium bg-red-500/10 px-2 py-0.5 rounded">
                    <XCircle className="w-3 h-3" /> Disconnected
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mb-1">
                Account: <span className="text-slate-300">{account.account_name || 'Unknown'}</span>
              </div>
              {!isHealthy && (
                <div className="mt-2">
                  <p className="text-xs text-red-400/80 mb-2">
                    {!isConnected 
                      ? 'Account disconnected. Reconnect to publish.'
                      : 'Access token expired. Please reconnect to refresh it.'}
                  </p>
                  <button
                    onClick={() => handleReconnect(account.platform_name)}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Reconnect {account.platform_name}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

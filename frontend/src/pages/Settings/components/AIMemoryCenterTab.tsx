import React, { useState, useEffect } from 'react';
import { aiMemoryApi, type MemorySourceStatus, type ProviderStatus } from '../../../services/api/aiMemoryApi';
import { Database, Activity, Server, RefreshCw, Trash2, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

const AIMemoryCenterTab: React.FC = () => {
  const [sources, setSources] = useState<MemorySourceStatus[]>([]);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [health, setHealth] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fSources, fProviders, fHealth] = await Promise.all([
        aiMemoryApi.getStatus(),
        aiMemoryApi.getProviders(),
        aiMemoryApi.getHealth()
      ]);
      setSources(fSources);
      setProviders(fProviders);
      setHealth(fHealth);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async (module: string) => {
    if (confirm(`Are you sure you want to trigger a manual refresh of ${module}? This may take a few minutes.`)) {
      try {
        await aiMemoryApi.refreshKnowledge(module);
        alert(`${module} knowledge refresh triggered successfully.`);
        fetchData();
      } catch (e) {
        alert('Failed to trigger refresh.');
      }
    }
  };

  const handleClearCache = async (cacheType: string) => {
    if (confirm(`Are you sure you want to clear the ${cacheType} cache?`)) {
      try {
        await aiMemoryApi.clearCache(cacheType);
        alert(`${cacheType} cache cleared successfully.`);
        fetchData();
      } catch (e) {
        alert('Failed to clear cache.');
      }
    }
  };

  const renderHealthIcon = (status: string) => {
    if (status === 'Healthy' || status === '100%') return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    if (status === 'Warning') return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    return <ShieldAlert className="w-5 h-5 text-rose-400" />;
  };

  if (loading && !sources.length) return <div className="text-text-muted">Loading diagnostics...</div>;

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h3 className="text-2xl font-bold text-text-primary flex items-center">
          <Database className="w-6 h-6 mr-3 text-purple-400" />
          AI Memory & Knowledge Center
        </h3>
        <p className="text-text-muted mt-1">
          Monitor the health, versioning, and cache states of all background AI intelligence modules.
        </p>
      </div>

      {/* System Health */}
      <div className="bg-gray-900 border border-border rounded-xl p-5">
        <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-400" />
          System Health
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(health).map(([key, value]) => (
            <div key={key} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{key.replace('_', ' ')}</span>
              <div className="flex items-center text-gray-200 font-medium text-sm">
                {renderHealthIcon(value)}
                <span className="ml-2">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Memory Sources */}
      <div className="bg-gray-900 border border-border rounded-xl p-5">
        <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-indigo-400" />
          Knowledge Sources
        </h4>
        <div className="space-y-4">
          {sources.map(source => (
            <div key={source.name} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 gap-4">
              <div>
                <div className="flex items-center">
                  <h5 className="font-semibold text-gray-200">{source.name}</h5>
                  <span className={`ml-3 px-2 py-0.5 rounded text-xs font-bold ${source.status === 'Healthy' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50' : 'bg-amber-900/40 text-amber-400 border border-amber-800/50'}`}>
                    {source.status}
                  </span>
                </div>
                <div className="flex text-xs text-text-muted mt-2 gap-4">
                  <span>Version: {source.version}</span>
                  <span>Confidence: {Math.round(source.confidence_score * 100)}%</span>
                  <span>Records: {source.total_records}</span>
                </div>
              </div>
              
              <button 
                onClick={() => handleRefresh(source.name)}
                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Providers */}
      <div className="bg-gray-900 border border-border rounded-xl p-5">
        <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
          <Server className="w-5 h-5 mr-2 text-rose-400" />
          Configured Providers
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-muted">
            <thead className="bg-gray-800/50 text-text-secondary uppercase text-xs">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Provider</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Req/Day</th>
                <th className="px-4 py-3">Success Rate</th>
                <th className="px-4 py-3 rounded-tr-lg">Token Usage</th>
              </tr>
            </thead>
            <tbody>
              {providers.map(p => (
                <tr key={p.name} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-200">{p.name}</td>
                  <td className="px-4 py-3">
                    {p.connected ? (
                      <span className="text-emerald-400 flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>Connected</span>
                    ) : (
                      <span className="text-gray-500 flex items-center"><div className="w-2 h-2 rounded-full bg-gray-600 mr-2"></div>Offline</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{p.current_model}</td>
                  <td className="px-4 py-3">{p.requests_today}</td>
                  <td className="px-4 py-3">{p.success_rate}</td>
                  <td className="px-4 py-3">{p.token_usage.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cache Management */}
      <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-5">
        <h4 className="text-lg font-semibold text-rose-200 mb-4 flex items-center">
          <ShieldAlert className="w-5 h-5 mr-2 text-rose-400" />
          Developer Tools
        </h4>
        <p className="text-sm text-text-muted mb-4">Warning: Manual operations can impact system performance and reset ongoing learning loops.</p>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => handleClearCache('AI Cache')}
            className="flex items-center px-4 py-2 bg-rose-900/50 hover:bg-rose-900 border border-rose-800/50 text-rose-200 rounded-md text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear AI Cache
          </button>
          <button 
            onClick={() => handleClearCache('Embeddings Cache')}
            className="flex items-center px-4 py-2 bg-rose-900/50 hover:bg-rose-900 border border-rose-800/50 text-rose-200 rounded-md text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Embeddings
          </button>
        </div>
      </div>

    </div>
  );
};

export default AIMemoryCenterTab;


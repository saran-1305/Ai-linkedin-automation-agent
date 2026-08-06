import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Code, AlertTriangle } from 'lucide-react';
import { httpClient } from '../../../services/api/httpClient';

const DeveloperSettingsTab: React.FC = () => {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(user?.developer_mode_enabled || false);
  const [saving, setSaving] = useState(false);

  const toggleDevMode = async () => {
    setSaving(true);
    try {
      const newState = !enabled;
      // We assume there's an endpoint to update dev mode, let's just make it up as /auth/dev-mode 
      // or we can simulate it with a generic settings update if one exists.
      // Since it's on User model, we'll need a quick endpoint.
      await httpClient.post('/auth/dev-mode', { enabled: newState });
      
      setEnabled(newState);
      
      // Update local storage so context picks it up on refresh.
      // A better way is to update the context directly, but a reload is fine for now to apply global DevMode.
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Failed to update developer mode.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Code className="w-6 h-6 text-indigo-500" /> Developer Mode
        </h3>
        <p className="text-text-secondary mt-1">
          Advanced settings and manual overrides for administrators.
        </p>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
          <div>
            <h4 className="text-orange-400 font-medium">Warning</h4>
            <p className="text-sm text-orange-400/80 mt-1">
              Enabling Developer Mode reveals manual workflow triggers across the application. 
              Using these triggers can interfere with the autonomous background AI and cause duplicate data. 
              Only use for debugging and testing.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Enable Developer Overrides</h4>
            <p className="text-sm text-slate-400">Shows manual "Generate" buttons on all modules.</p>
          </div>
          <button
            onClick={toggleDevMode}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeveloperSettingsTab;

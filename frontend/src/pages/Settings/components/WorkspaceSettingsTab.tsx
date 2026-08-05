import React, { useState, useEffect } from 'react';
import { settingsApi, type WorkspaceSettings } from '../../../services/api/settingsApi';
import { Save } from 'lucide-react';

const WorkspaceSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.getWorkspaceSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await settingsApi.updateWorkspaceSettings(settings);
      alert('Workspace settings saved successfully.');
    } catch (e) {
      console.error(e);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="text-text-muted">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 mb-6">
        <h3 className="text-xl font-bold text-text-primary">Workspace Settings</h3>
        <p className="text-text-muted mt-1">Manage global configuration for your workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Workspace Name</label>
          <input 
            type="text" 
            value={settings.workspace_name}
            onChange={(e) => setSettings({...settings, workspace_name: e.target.value})}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Time Zone</label>
          <select 
            value={settings.time_zone}
            onChange={(e) => setSettings({...settings, time_zone: e.target.value})}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="UTC">UTC</option>
            <option value="EST">EST</option>
            <option value="PST">PST</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Language</label>
          <select 
            value={settings.language}
            onChange={(e) => setSettings({...settings, language: e.target.value})}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Spanish</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Default Currency</label>
          <input 
            type="text" 
            value={settings.default_currency}
            onChange={(e) => setSettings({...settings, default_currency: e.target.value})}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-border flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default WorkspaceSettingsTab;


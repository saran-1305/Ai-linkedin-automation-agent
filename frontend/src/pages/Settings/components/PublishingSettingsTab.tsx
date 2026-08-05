import React, { useState, useEffect } from 'react';
import { settingsApi, type PublishingSettings } from '../../../services/api/settingsApi';
import { Save } from 'lucide-react';

const PublishingSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<PublishingSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.getPublishingSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await settingsApi.updatePublishingSettings(settings);
      alert('Publishing Defaults saved successfully.');
    } catch (e) {
      console.error(e);
      alert('Failed to save publishing defaults.');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="text-text-muted">Loading publishing config...</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 mb-6">
        <h3 className="text-xl font-bold text-text-primary">Publishing Defaults</h3>
        <p className="text-text-muted mt-1">Configure default parameters for the Publishing Assistant.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Default Platform</label>
          <select 
            value={settings.default_platform}
            onChange={(e) => setSettings({...settings, default_platform: e.target.value})}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">X (Twitter)</option>
            <option value="medium">Medium</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Default Publish Time</label>
          <input 
            type="time" 
            value={settings.default_publish_time}
            onChange={(e) => setSettings({...settings, default_publish_time: e.target.value})}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Publishing Queue Limit</label>
          <input 
            type="number" 
            value={settings.publishing_queue_limit}
            onChange={(e) => setSettings({...settings, publishing_queue_limit: parseInt(e.target.value)})}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Retry Attempts on Failure</label>
          <input 
            type="number" 
            value={settings.retry_attempts}
            onChange={(e) => setSettings({...settings, retry_attempts: parseInt(e.target.value)})}
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
          {saving ? 'Saving...' : 'Save Defaults'}
        </button>
      </div>
    </div>
  );
};

export default PublishingSettingsTab;


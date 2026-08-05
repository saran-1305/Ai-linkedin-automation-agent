import React, { useState, useEffect } from 'react';
import { settingsApi, type AISettings } from '../../../services/api/settingsApi';
import { Save } from 'lucide-react';

const AISettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.getAISettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await settingsApi.updateAISettings(settings);
      alert('AI Configuration saved successfully.');
    } catch (e) {
      console.error(e);
      alert('Failed to save AI configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="text-text-muted">Loading AI config...</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 mb-6">
        <h3 className="text-xl font-bold text-text-primary">AI Configuration</h3>
        <p className="text-text-muted mt-1">Configure global AI providers and generation parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">AI Provider</label>
          <select 
            value={settings.ai_provider}
            onChange={(e) => setSettings({...settings, ai_provider: e.target.value})}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="groq">Groq</option>
            <option value="ollama">Ollama (Local)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Provider API Key</label>
          <input 
            type="password" 
            value={settings.provider_api_key}
            onChange={(e) => setSettings({...settings, provider_api_key: e.target.value})}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
            placeholder="sk-..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Default Model</label>
          <input 
            type="text" 
            value={settings.model_selection}
            onChange={(e) => setSettings({...settings, model_selection: e.target.value})}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Temperature: {settings.temperature}</label>
          <input 
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
            className="w-full accent-purple-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Brand Voice Preference</label>
          <select 
            value={settings.brand_voice_preference}
            onChange={(e) => setSettings({...settings, brand_voice_preference: e.target.value})}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="authoritative">Authoritative</option>
            <option value="casual">Casual</option>
            <option value="academic">Academic</option>
            <option value="conversational">Conversational</option>
          </select>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-border flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save AI Config'}
        </button>
      </div>
    </div>
  );
};

export default AISettingsTab;


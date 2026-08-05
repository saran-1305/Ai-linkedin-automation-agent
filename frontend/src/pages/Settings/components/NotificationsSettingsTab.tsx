import React, { useState } from 'react';
import { Save, Bell, Mail, MessageSquare } from 'lucide-react';

const NotificationsSettingsTab: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    email_publishing: true,
    email_analytics: true,
    email_recommendations: false,
    in_app_errors: true,
    in_app_security: true,
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Notification settings saved successfully!');
    }, 600);
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 mb-6">
        <h3 className="text-xl font-bold text-text-primary flex items-center">
          <Bell className="w-6 h-6 mr-3 text-purple-400" />
          Notifications
        </h3>
        <p className="text-text-muted mt-1">Control how and when you want to receive alerts.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-900 border border-border rounded-xl p-5">
          <h4 className="text-lg font-medium text-gray-200 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-blue-400" />
            Email Notifications
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 font-medium">Publishing Updates</p>
                <p className="text-sm text-gray-500">Get notified when a post is successfully published or fails.</p>
              </div>
              <input type="checkbox" checked={settings.email_publishing} onChange={() => toggleSetting('email_publishing')} className="w-5 h-5 accent-purple-500" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 font-medium">Weekly Analytics Report</p>
                <p className="text-sm text-gray-500">Receive a weekly summary of your performance.</p>
              </div>
              <input type="checkbox" checked={settings.email_analytics} onChange={() => toggleSetting('email_analytics')} className="w-5 h-5 accent-purple-500" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 font-medium">AI Recommendations</p>
                <p className="text-sm text-gray-500">Get an email when the AI has a new high-priority growth opportunity.</p>
              </div>
              <input type="checkbox" checked={settings.email_recommendations} onChange={() => toggleSetting('email_recommendations')} className="w-5 h-5 accent-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-border rounded-xl p-5">
          <h4 className="text-lg font-medium text-gray-200 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-emerald-400" />
            In-App Alerts
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 font-medium">System Errors</p>
                <p className="text-sm text-gray-500">Show alerts for failed API connections or platform issues.</p>
              </div>
              <input type="checkbox" checked={settings.in_app_errors} onChange={() => toggleSetting('in_app_errors')} className="w-5 h-5 accent-purple-500" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 font-medium">Security Alerts</p>
                <p className="text-sm text-gray-500">Show alerts for new logins and connected devices.</p>
              </div>
              <input type="checkbox" checked={settings.in_app_security} onChange={() => toggleSetting('in_app_security')} className="w-5 h-5 accent-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-border flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export default NotificationsSettingsTab;


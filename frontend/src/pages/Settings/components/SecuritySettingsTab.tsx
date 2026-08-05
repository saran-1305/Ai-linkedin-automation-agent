import React, { useState } from 'react';
import { Save, Shield, Key, Smartphone } from 'lucide-react';

const SecuritySettingsTab: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordUpdate = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      alert('Password updated successfully!');
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 mb-6">
        <h3 className="text-xl font-bold text-text-primary flex items-center">
          <Shield className="w-6 h-6 mr-3 text-purple-400" />
          Security
        </h3>
        <p className="text-text-muted mt-1">Manage your account security and active sessions.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-900 border border-border rounded-xl p-5">
          <h4 className="text-lg font-medium text-gray-200 mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2 text-blue-400" />
            Update Password
          </h4>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-sm text-text-muted mb-1 block">Current Password</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-purple-500" 
              />
            </div>
            <div>
              <label className="text-sm text-text-muted mb-1 block">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-purple-500" 
              />
            </div>
            <button 
              onClick={handlePasswordUpdate}
              disabled={saving || !currentPassword || !newPassword}
              className="mt-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-200 flex items-center">
              <Smartphone className="w-5 h-5 mr-2 text-emerald-400" />
              Active Sessions
            </h4>
            <button className="text-sm text-rose-400 hover:text-rose-300">Log out all devices</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
              <div>
                <p className="text-gray-200 font-medium">Windows PC - Chrome</p>
                <p className="text-xs text-emerald-400">Active Now • IP: 192.168.1.5</p>
              </div>
              <button className="text-xs text-gray-500 uppercase font-bold tracking-wider px-2 py-1 bg-gray-900 rounded">Current</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
              <div>
                <p className="text-gray-200 font-medium">iPhone 14 Pro - Safari</p>
                <p className="text-xs text-gray-500">Last active: 2 hours ago • IP: 172.56.21.3</p>
              </div>
              <button className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1">Revoke</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettingsTab;


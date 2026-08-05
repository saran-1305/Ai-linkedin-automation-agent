import React, { useState } from 'react';
import { Save, Palette, Moon, Sun, Monitor } from 'lucide-react';

const AppearanceSettingsTab: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [density, setDensity] = useState('comfortable');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      
      if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
      }
      
      alert('Appearance preferences saved! Note: Some changes may require a page reload.');
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 mb-6">
        <h3 className="text-xl font-bold text-text-primary flex items-center">
          <Palette className="w-6 h-6 mr-3 text-purple-400" />
          Appearance
        </h3>
        <p className="text-text-muted mt-1">Customize the look and feel of the platform.</p>
      </div>

      <div className="space-y-8">
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-4 uppercase tracking-wider">Interface Theme</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left transition-all ${theme === 'light' ? 'bg-purple-900/20 border-purple-500 ring-1 ring-purple-500' : 'bg-gray-900 border-border hover:border-gray-600'}`}
            >
              <Sun className="w-6 h-6 mb-3 text-amber-400" />
              <p className="font-semibold text-gray-200">Light Mode</p>
              <p className="text-xs text-gray-500 mt-1">Clean and bright</p>
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left transition-all ${theme === 'dark' ? 'bg-purple-900/20 border-purple-500 ring-1 ring-purple-500' : 'bg-gray-900 border-border hover:border-gray-600'}`}
            >
              <Moon className="w-6 h-6 mb-3 text-indigo-400" />
              <p className="font-semibold text-gray-200">Dark Mode</p>
              <p className="text-xs text-gray-500 mt-1">Easy on the eyes (Default)</p>
            </button>
            <button 
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border text-left transition-all ${theme === 'system' ? 'bg-purple-900/20 border-purple-500 ring-1 ring-purple-500' : 'bg-gray-900 border-border hover:border-gray-600'}`}
            >
              <Monitor className="w-6 h-6 mb-3 text-text-muted" />
              <p className="font-semibold text-gray-200">System Setting</p>
              <p className="text-xs text-gray-500 mt-1">Follows OS preferences</p>
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-4 uppercase tracking-wider">Information Density</h4>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
              <input 
                type="radio" 
                checked={density === 'compact'} 
                onChange={() => setDensity('compact')}
                className="w-4 h-4 accent-purple-500" 
              />
              Compact (More data)
            </label>
            <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
              <input 
                type="radio" 
                checked={density === 'comfortable'} 
                onChange={() => setDensity('comfortable')}
                className="w-4 h-4 accent-purple-500" 
              />
              Comfortable (Spaced out)
            </label>
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
          {saving ? 'Saving...' : 'Apply Settings'}
        </button>
      </div>
    </div>
  );
};

export default AppearanceSettingsTab;


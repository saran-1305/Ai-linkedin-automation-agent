import React, { useState } from 'react';
import { Settings, Building2, BrainCircuit, Globe, Bell, Shield, Palette, Zap, Database, ChevronRight, Code } from 'lucide-react';
import WorkspaceSettingsTab from './components/WorkspaceSettingsTab';
import AISettingsTab from './components/AISettingsTab';
import PublishingSettingsTab from './components/PublishingSettingsTab';
import AIMemoryCenterTab from './components/AIMemoryCenterTab';
import NotificationsSettingsTab from './components/NotificationsSettingsTab';
import SecuritySettingsTab from './components/SecuritySettingsTab';
import AppearanceSettingsTab from './components/AppearanceSettingsTab';
import IntegrationsSettingsTab from './components/IntegrationsSettingsTab';
import DeveloperSettingsTab from './components/DeveloperSettingsTab';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workspace');

  const tabs = [
    { id: 'workspace', name: 'Workspace', icon: Building2 },
    { id: 'ai', name: 'AI Configuration', icon: BrainCircuit },
    { id: 'publishing', name: 'Publishing Defaults', icon: Globe },
    { id: 'memory', name: 'AI Memory Center', icon: Database },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'integrations', name: 'Integrations', icon: Zap },
  ];
  
  const { user } = useAuth();
  if (user?.role === 'admin') {
    tabs.push({ id: 'developer', name: 'Developer', icon: Code });
  }

  return (
    <div className="space-y-6 animate-in pb-24 max-w-7xl mx-auto">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" /> Global Settings
          </h2>
          <p className="text-text-secondary mt-1 font-medium">Manage your workspace, AI engine preferences, and integrations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-2">
           <Card className="border-border bg-surface">
             <CardContent className="p-4 flex flex-col gap-1.5">
               {tabs.map(tab => {
                 const Icon = tab.icon;
                 const isActive = activeTab === tab.id;
                 return (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all text-sm font-bold ${
                       isActive 
                         ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                         : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-transparent'
                     }`}
                   >
                     <div className="flex items-center">
                       <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                       {tab.name}
                     </div>
                     {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
                   </button>
                 );
               })}
             </CardContent>
           </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9">
          <Card className="border-border bg-surface min-h-[600px]">
            <CardContent className="p-8">
              {activeTab === 'workspace' && <WorkspaceSettingsTab />}
              {activeTab === 'ai' && <AISettingsTab />}
              {activeTab === 'publishing' && <PublishingSettingsTab />}
              {activeTab === 'memory' && <AIMemoryCenterTab />}
              
              {activeTab === 'notifications' && <NotificationsSettingsTab />}
              {activeTab === 'security' && <SecuritySettingsTab />}
              {activeTab === 'appearance' && <AppearanceSettingsTab />}
              {activeTab === 'integrations' && <IntegrationsSettingsTab />}
              {activeTab === 'developer' && <DeveloperSettingsTab />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

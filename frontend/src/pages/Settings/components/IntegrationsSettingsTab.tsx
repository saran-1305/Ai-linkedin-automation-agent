import React, { useState } from 'react';
import { Zap, ExternalLink, Link2, Link2Off } from 'lucide-react';

const IntegrationsSettingsTab: React.FC = () => {
  const [integrations, setIntegrations] = useState([
    { id: 'notion', name: 'Notion', desc: 'Sync knowledge base to Notion', connected: true },
    { id: 'slack', name: 'Slack', desc: 'Send alerts to a Slack channel', connected: false },
    { id: 'drive', name: 'Google Drive', desc: 'Import documents directly', connected: false },
    { id: 'zapier', name: 'Zapier', desc: 'Connect to 5000+ apps', connected: false },
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(integrations.map(int => 
      int.id === id ? { ...int, connected: !int.connected } : int
    ));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 mb-6">
        <h3 className="text-xl font-bold text-text-primary flex items-center">
          <Zap className="w-6 h-6 mr-3 text-purple-400" />
          Integrations
        </h3>
        <p className="text-text-muted mt-1">Connect the AI Growth OS to your favorite third-party tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map(integration => (
          <div key={integration.id} className="bg-gray-900 border border-border rounded-xl p-5 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-medium text-gray-200">{integration.name}</h4>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${integration.connected ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                {integration.connected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
            
            <p className="text-text-muted text-sm mb-6 flex-1">{integration.desc}</p>
            
            <button 
              onClick={() => toggleIntegration(integration.id)}
              className={`w-full flex justify-center items-center py-2 rounded-lg text-sm font-medium transition-colors border ${integration.connected ? 'bg-gray-800 hover:bg-gray-700 text-text-secondary border-gray-600' : 'bg-primary hover:bg-primary/90 text-primary-foreground border-purple-500'}`}
            >
              {integration.connected ? (
                <><Link2Off className="w-4 h-4 mr-2" /> Disconnect</>
              ) : (
                <><Link2 className="w-4 h-4 mr-2" /> Connect</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsSettingsTab;


import React from 'react';
import type { ProviderStatus } from '../../../services/api/analyticsApi';

interface Props {
  status: ProviderStatus[];
}

const PlatformStatusPanel: React.FC<Props> = ({ status }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
      <h2 className="text-xl font-semibold mb-6 text-gray-200 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Platform Status
      </h2>
      
      <div className="space-y-4">
        {status.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No platform connections found.</div>
        ) : (
          status.map((provider) => (
            <div key={provider.provider_name} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold capitalize text-gray-200">{provider.provider_name}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  provider.sync_status === 'idle' ? 'bg-gray-700 text-gray-300' :
                  provider.sync_status === 'syncing' ? 'bg-blue-900 text-blue-300 animate-pulse' :
                  'bg-red-900 text-red-300'
                }`}>
                  {provider.sync_status}
                </span>
              </div>
              <div className="text-sm text-gray-500 flex flex-col space-y-1">
                <div className="flex justify-between">
                  <span>Last Sync:</span>
                  <span>{provider.last_sync ? new Date(provider.last_sync).toLocaleTimeString() : 'Never'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Sync:</span>
                  <span>{provider.next_sync ? new Date(provider.next_sync).toLocaleTimeString() : 'Not Scheduled'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlatformStatusPanel;

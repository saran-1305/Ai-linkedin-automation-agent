import React from 'react';
import type { AnalyticsCollectionRun } from '../../../services/api/analyticsApi';

interface Props {
  history: AnalyticsCollectionRun[];
}

const CollectionHistoryPanel: React.FC<Props> = ({ history }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 h-96 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-6 text-gray-200 flex items-center">
        <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Collection History
      </h2>
      
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No collection history available.</div>
        ) : (
          history.slice().reverse().map((run) => (
            <div key={run.run_id} className="bg-gray-900 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-300 text-sm">
                    {run.provider.charAt(0).toUpperCase() + run.provider.slice(1)} Sync
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(run.started_at).toLocaleString()}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  run.status === 'completed' ? 'text-green-400 bg-green-400/10' :
                  run.status === 'failed' ? 'text-red-400 bg-red-400/10' :
                  'text-blue-400 bg-blue-400/10'
                }`}>
                  {run.status}
                </span>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-800 p-2 rounded flex flex-col items-center">
                  <span className="text-gray-500">Success</span>
                  <span className="text-green-400 font-semibold">{run.collected_posts}</span>
                </div>
                <div className="bg-gray-800 p-2 rounded flex flex-col items-center">
                  <span className="text-gray-500">Failed</span>
                  <span className="text-red-400 font-semibold">{run.failed_posts}</span>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-600 text-right">
                Duration: {run.duration.toFixed(2)}s
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CollectionHistoryPanel;

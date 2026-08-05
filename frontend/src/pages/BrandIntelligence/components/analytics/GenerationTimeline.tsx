import React from 'react';
import { Clock, RefreshCw, CheckCircle2 } from 'lucide-react';

interface GenerationTimelineProps {
  versions: any[];
}

export const GenerationTimeline: React.FC<GenerationTimelineProps> = ({ versions }) => {
  if (!versions || versions.length === 0) return null;

  // Show only top 5 recent versions for the timeline
  const recentVersions = [...versions].reverse().slice(0, 5);

  return (
    <div className="w-full bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h4 className="text-sm font-semibold text-gray-400 mb-6 flex items-center gap-2">
        <Clock className="w-4 h-4" /> AI Generation Timeline
      </h4>
      
      <div className="relative border-l border-gray-800 ml-3 space-y-8">
        {recentVersions.map((v, idx) => (
          <div key={v.id} className="relative pl-6">
            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-gray-900 ${idx === 0 ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-bold text-white">Version {v.version} Generated</h5>
                {idx === 0 && (
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                {new Date(v.created_at).toLocaleString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
              
              <div className="mt-2 grid grid-cols-2 gap-4 text-xs bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <div className="flex flex-col">
                  <span className="text-gray-400">Documents Analyzed</span>
                  <span className="text-white font-medium flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-green-400" /> {v.document_count} files
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400">Processing Time</span>
                  <span className="text-white font-medium flex items-center gap-1 mt-0.5">
                    <RefreshCw className="w-3 h-3 text-blue-400" /> {(v.generation_duration / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-gray-400">AI Model Used</span>
                  <span className="text-white font-medium truncate mt-0.5" title={v.model_name}>
                    {v.model_name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

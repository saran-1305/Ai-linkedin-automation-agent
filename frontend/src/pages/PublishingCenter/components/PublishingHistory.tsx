import React from 'react';
import { History, Globe, Clock, AlertCircle } from 'lucide-react';

export const PublishingHistory = ({ jobs }: { jobs: any[] }) => {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col h-[600px]">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-indigo-400" />
        Publishing History
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {jobs.filter(j => j.status === 'Published' || j.status === 'Verified Published' || j.status === 'Failed' || j.status === 'Verification Failed').length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No publishing history available.</p>
          </div>
        ) : (
          jobs.filter(j => j.status === 'Published' || j.status === 'Verified Published' || j.status === 'Failed' || j.status === 'Verification Failed').map(job => (
            <div key={job.id} className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">{job.platform}</span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    job.status.includes('Verified') ? 'bg-emerald-500/20 text-emerald-400' :
                    job.status === 'Failed' ? 'bg-red-500/20 text-red-400' :
                    job.status === 'Verification Failed' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {job.status}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-slate-300 flex flex-col gap-1.5 mt-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {job.published_at ? `Published: ${new Date(job.published_at).toLocaleString()}` : 'Attempted: -'}
                </div>
                {job.published_url && (
                  <div className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 cursor-pointer">
                    <Globe className="w-3.5 h-3.5" />
                    <a href={job.published_url} target="_blank" rel="noreferrer">View Live Post</a>
                  </div>
                )}
                {job.status.includes('Failed') && (
                  <div className="flex items-center gap-1.5 text-red-400 bg-red-500/10 p-2 rounded mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Failed after {job.retry_count} retries. Check logs for details.</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

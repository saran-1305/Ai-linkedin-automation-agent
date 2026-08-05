import React from 'react';
import { ShieldCheck, Database, Zap } from 'lucide-react';

interface BrandConfidenceProps {
  confidenceScores: any[];
  versions: any[];
}

export const BrandConfidence: React.FC<BrandConfidenceProps> = ({ confidenceScores, versions }) => {
  const overall = confidenceScores?.find((c: any) => c.category === 'overall')?.current_confidence || 0;
  const score = Math.round(overall * 100);
  
  const latestVersion = versions && versions.length > 0 ? versions[0] : null;
  const docCount = latestVersion?.document_count || 0;
  
  // Determine color based on score
  let color = "text-red-400";
  let bgBar = "bg-red-400";
  if (score >= 80) { color = "text-green-400"; bgBar = "bg-green-400"; }
  else if (score >= 60) { color = "text-yellow-400"; bgBar = "bg-yellow-400"; }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className={`w-6 h-6 ${color}`} />
          <h3 className="text-lg font-semibold text-white">Overall Confidence</h3>
        </div>
        <div className={`text-4xl font-bold mb-4 ${color}`}>{score}%</div>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div className={`${bgBar} h-2 rounded-full transition-all duration-1000`} style={{ width: `${score}%` }}></div>
        </div>
        <p className="text-xs text-gray-400">Based on consistency across analyzed documents.</p>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Knowledge Base</h3>
        </div>
        <div className="text-4xl font-bold text-white mb-4">{docCount}</div>
        <p className="text-sm text-gray-300 mb-2">Documents analyzed in this version</p>
        <p className="text-xs text-gray-400">Import more documents to increase confidence and coverage.</p>
      </div>
      
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Generation Status</h3>
        </div>
        <div className="text-xl font-medium text-white mb-2">Version {latestVersion?.version || 1}</div>
        <p className="text-sm text-gray-300 mb-2">
          Generated: {latestVersion?.generated_at ? new Date(latestVersion.generated_at).toLocaleString() : 'Just now'}
        </p>
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
          Active Profile
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import type { ExecutiveOptimizationSummary } from '../../../services/api/recommendationsApi';
import { Target, Zap, AlertTriangle, Briefcase } from 'lucide-react';

interface Props {
  summary: ExecutiveOptimizationSummary;
}

const ExecutiveSummary: React.FC<Props> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-3">
            <Target className="w-5 h-5 text-emerald-400 mr-2" />
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Top Opportunity</h3>
          </div>
          <p className="text-gray-100 font-medium">{summary.top_opportunity}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 mr-2" />
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Biggest Risk</h3>
          </div>
          <p className="text-gray-100 font-medium">{summary.biggest_risk}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-3">
            <Zap className="w-5 h-5 text-amber-400 mr-2" />
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Quick Win</h3>
          </div>
          <p className="text-gray-100 font-medium">{summary.quick_win}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-3">
            <Briefcase className="w-5 h-5 text-blue-400 mr-2" />
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Strategic Focus</h3>
          </div>
          <p className="text-gray-100 font-medium">{summary.strategic_focus}</p>
        </div>
      </div>

    </div>
  );
};

export default ExecutiveSummary;

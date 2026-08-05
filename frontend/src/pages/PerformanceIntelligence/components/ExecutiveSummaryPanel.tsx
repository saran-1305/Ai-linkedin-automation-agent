import React from 'react';
import type { ExecutiveSummary } from '../../../services/api/performanceIntelligenceApi';
import { Target, Trophy, TrendingUp, AlertTriangle } from 'lucide-react';

interface Props {
  summary: ExecutiveSummary;
}

const ExecutiveSummaryPanel: React.FC<Props> = ({ summary }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-gray-100 flex items-center">
          <Target className="w-6 h-6 mr-2 text-purple-400" />
          Executive Summary
        </h2>
        <span className="text-xs text-gray-400">
          Generated {new Date(summary.generated_at).toLocaleString()}
        </span>
      </div>

      <p className="text-lg text-gray-300 font-medium leading-relaxed mb-8">
        {summary.overall_performance}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 p-5 rounded-lg border border-emerald-900/50">
          <h3 className="text-emerald-400 font-semibold flex items-center mb-4">
            <Trophy className="w-5 h-5 mr-2" /> Key Wins
          </h3>
          <ul className="space-y-2">
            {(summary?.key_wins || []).map((win, idx) => (
              <li key={idx} className="text-gray-300 text-sm flex items-start">
                <span className="text-emerald-500 mr-2 mt-0.5">•</span> {win}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-900/50 p-5 rounded-lg border border-blue-900/50">
          <h3 className="text-blue-400 font-semibold flex items-center mb-4">
            <TrendingUp className="w-5 h-5 mr-2" /> Top Opportunities
          </h3>
          <ul className="space-y-2">
            {(summary?.top_opportunities || []).map((opp, idx) => (
              <li key={idx} className="text-gray-300 text-sm flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span> {opp}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-900/50 p-5 rounded-lg border border-rose-900/50">
          <h3 className="text-rose-400 font-semibold flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 mr-2" /> Key Challenges
          </h3>
          <ul className="space-y-2">
            {(summary?.key_challenges || []).map((challenge, idx) => (
              <li key={idx} className="text-gray-300 text-sm flex items-start">
                <span className="text-rose-500 mr-2 mt-0.5">•</span> {challenge}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummaryPanel;

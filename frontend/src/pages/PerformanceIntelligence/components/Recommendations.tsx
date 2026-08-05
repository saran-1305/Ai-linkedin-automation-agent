import React from 'react';
import type { PerformanceRecommendation } from '../../../services/api/performanceIntelligenceApi';
import { Compass, CheckCircle2, ChevronRight } from 'lucide-react';

interface Props {
  recommendations: PerformanceRecommendation[];
}

const RecommendationsPanel: React.FC<Props> = ({ recommendations }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-100 flex items-center">
          <Compass className="w-5 h-5 mr-2 text-cyan-400" />
          Strategic Recommendations
        </h2>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="bg-gray-900/50 rounded-lg p-5 border border-cyan-900/30 hover:border-cyan-700/50 transition-colors relative overflow-hidden group">
            {rec.priority === 'high' && (
              <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase">
                High Priority
              </div>
            )}
            
            <div className="flex items-start mt-1">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-200 mb-2">{rec.recommendation}</h3>
                
                <div className="space-y-2 mt-3 text-sm">
                  <div className="grid grid-cols-4 gap-2">
                    <span className="text-gray-500 col-span-1">Reason</span>
                    <span className="text-gray-300 col-span-3">{rec.reason}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <span className="text-gray-500 col-span-1">Impact</span>
                    <span className="text-emerald-400 font-medium col-span-3">{rec.expected_impact}</span>
                  </div>
                  {rec.historical_comparison && (
                    <div className="grid grid-cols-4 gap-2">
                      <span className="text-gray-500 col-span-1">Context</span>
                      <span className="text-gray-400 italic col-span-3">{rec.historical_comparison}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <button className="w-full mt-4 flex items-center justify-center py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm text-gray-300 font-medium transition-colors">
              Apply to Strategy Planner <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        ))}
        {recommendations.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">No recommendations available.</p>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPanel;

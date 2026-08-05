import React from 'react';
import type { PerformanceInsight } from '../../../services/api/performanceIntelligenceApi';
import { Lightbulb, Info } from 'lucide-react';

interface Props {
  insights: PerformanceInsight[];
}

const AIInsightsList: React.FC<Props> = ({ insights }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-100 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
          Pattern Insights
        </h2>
      </div>

      <div className="space-y-4">
        {insights.map((insight, idx) => (
          <div key={insight.id || idx} className="bg-gray-900/50 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-200 capitalize">
                [{insight.insight_type}] {insight.title}
              </h3>
              <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400 font-medium">
                {Math.round(insight.confidence * 100)}% Confidence
              </span>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">{insight.description}</p>
            
            <div className="bg-blue-900/10 rounded border border-blue-900/30 p-3 flex items-start">
              <Info className="w-4 h-4 text-blue-400 mr-2 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-200">
                <span className="font-semibold text-blue-400">Action: </span>
                {insight.suggested_action}
              </p>
            </div>
          </div>
        ))}
        {insights.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">No new insights detected yet.</p>
        )}
      </div>
    </div>
  );
};

export default AIInsightsList;

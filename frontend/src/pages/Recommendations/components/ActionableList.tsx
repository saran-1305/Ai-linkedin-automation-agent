import React from 'react';
import type { Recommendation } from '../../../services/api/recommendationsApi';
import { CheckCircle, XCircle, Clock, ChevronRight, Activity, Users, Settings, TrendingUp } from 'lucide-react';

interface Props {
  recommendations: Recommendation[];
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
}

const ActionableList: React.FC<Props> = ({ recommendations, onAccept, onDismiss }) => {
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content': return <Settings className="w-5 h-5 text-purple-400" />;
      case 'publishing': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'audience': return <Users className="w-5 h-5 text-emerald-400" />;
      case 'growth': return <TrendingUp className="w-5 h-5 text-amber-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-rose-900/40 text-rose-400 border-rose-800/50';
      case 'high': return 'bg-orange-900/40 text-orange-400 border-orange-800/50';
      case 'medium': return 'bg-blue-900/40 text-blue-400 border-blue-800/50';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 h-full">
      <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-gray-100 flex items-center">
          Pending Recommendations
          <span className="ml-3 bg-gray-700 text-gray-300 text-xs py-0.5 px-2 rounded-full font-medium">
            {recommendations.length} New
          </span>
        </h2>
      </div>

      <div className="space-y-4">
        {recommendations.map(rec => (
          <div key={rec.id} className="bg-gray-900/50 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors flex flex-col md:flex-row gap-6">
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gray-800 rounded-lg shadow-sm border border-gray-700">
                  {getCategoryIcon(rec.category)}
                </div>
                <h3 className="font-semibold text-gray-200 text-lg">{rec.title}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityColor(rec.priority)}`}>
                  {rec.priority}
                </span>
              </div>
              
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {rec.description}
              </p>

              <div className="flex items-center gap-4 text-sm bg-gray-800/50 rounded p-3 border border-gray-700/50">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs">Expected Impact</span>
                  <span className="text-emerald-400 font-medium">{rec.expected_impact}</span>
                </div>
                <div className="w-px h-8 bg-gray-700"></div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs">Confidence</span>
                  <span className="text-blue-400 font-medium">{Math.round(rec.confidence * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 justify-center min-w-[140px]">
              <button 
                onClick={() => onAccept(rec.id)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center text-sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Accept
              </button>
              
              <button 
                onClick={() => onDismiss(rec.id)}
                className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 font-medium rounded-lg transition-all flex items-center justify-center text-sm"
              >
                <XCircle className="w-4 h-4 mr-2" /> Dismiss
              </button>
            </div>

          </div>
        ))}

        {recommendations.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
            <h3 className="text-gray-300 font-medium text-lg">You're all caught up!</h3>
            <p className="text-gray-500 text-sm mt-1">The AI is currently analyzing your latest performance data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionableList;

import React from 'react';
import type { OptimizationGoal } from '../../../services/api/recommendationsApi';
import { Target, TrendingUp } from 'lucide-react';

interface Props {
  goals: OptimizationGoal[];
}

const OptimizationGoalsView: React.FC<Props> = ({ goals }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 h-full">
      <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-gray-100 flex items-center">
          <Target className="w-6 h-6 mr-2 text-indigo-400" />
          Optimization Goals
        </h2>
      </div>

      <div className="space-y-6">
        {goals.map(goal => (
          <div key={goal.id} className="bg-gray-900/50 rounded-lg p-5 border border-indigo-900/30">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-gray-200">{goal.goal}</h3>
              <span className="text-xs px-2 py-1 bg-indigo-900/40 text-indigo-400 rounded font-medium border border-indigo-800/50">
                {goal.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-gray-200 font-medium">{goal.progress}%</span>
              </div>
              
              <div className="w-full bg-gray-800 rounded-full h-2.5 border border-gray-700">
                <div 
                  className="bg-indigo-500 h-2.5 rounded-full" 
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span className="flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Current: {goal.current_value}
                </span>
                <span>Target: {goal.target_value}</span>
              </div>
            </div>
          </div>
        ))}
        
        {goals.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">No active goals.</p>
        )}
      </div>
    </div>
  );
};

export default OptimizationGoalsView;

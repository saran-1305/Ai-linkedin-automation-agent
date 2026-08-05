import React from 'react';
import type { PerformanceMemory } from '../../../services/api/performanceIntelligenceApi';
import { Database, Clock } from 'lucide-react';

interface Props {
  memory: PerformanceMemory;
}

const PerformanceMemoryView: React.FC<Props> = ({ memory }) => {
  const renderList = (title: string, items: any[], field: string) => (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex justify-between items-center text-sm">
            <span className="text-gray-200">{item[field] || item}</span>
            {item.score && (
              <span className="text-emerald-400 font-medium bg-emerald-900/20 px-2 py-0.5 rounded text-xs">
                {item.score}/10
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-gray-100 flex items-center">
          <Database className="w-6 h-6 mr-2 text-indigo-400" />
          Performance Memory
        </h2>
        <span className="text-xs text-gray-400 flex items-center">
          <Clock className="w-3.5 h-3.5 mr-1" />
          Last Updated {new Date(memory.last_updated).toLocaleTimeString()}
        </span>
      </div>
      
      <p className="text-sm text-gray-400 mb-6">
        This is the permanent AI knowledge source. Future modules like the Strategy Planner and Content Generator will use these learned preferences to optimize outputs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderList("Winning Topics", memory.winning_topics, "topic")}
        {renderList("Winning Hooks", memory.winning_hooks, "hook_type")}
        {renderList("Winning CTAs", memory.winning_ctas, "cta_type")}
        {renderList("Audience Preferences", memory.audience_preferences, "")}
      </div>
    </div>
  );
};

export default PerformanceMemoryView;

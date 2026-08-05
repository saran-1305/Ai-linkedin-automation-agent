import React from 'react';
import { Layers, Hash, BookOpen } from 'lucide-react';

interface BrandContentProps {
  pillars: any[];
  topics: any[];
  keywords: any[];
}

export const BrandContent: React.FC<BrandContentProps> = ({ pillars, topics, keywords }) => {
  // Sort by frequency
  const sortedPillars = [...pillars].sort((a, b) => (b.frequency || 0) - (a.frequency || 0));
  const sortedTopics = [...topics].sort((a, b) => (b.frequency || 0) - (a.frequency || 0));
  const sortedKeywords = [...keywords].sort((a, b) => (b.frequency || 0) - (a.frequency || 0));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Content Pillars */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" /> Content Pillars
        </h3>
        {sortedPillars.length === 0 ? (
          <p className="text-gray-500 italic">No pillars extracted.</p>
        ) : (
          <div className="space-y-4">
            {sortedPillars.slice(0, 5).map((p, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300 font-medium">{p.name}</span>
                  <span className="text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded text-xs">{p.frequency} mentions</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-indigo-400 h-1.5 rounded-full" 
                    style={{ width: `${Math.min((p.frequency / (sortedPillars[0]?.frequency || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Topics */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" /> Key Topics
        </h3>
        {sortedTopics.length === 0 ? (
          <p className="text-gray-500 italic">No topics extracted.</p>
        ) : (
          <div className="space-y-4">
            {sortedTopics.slice(0, 5).map((t, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300 font-medium truncate pr-2">{t.name}</span>
                  <span className="text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded text-xs">{t.frequency}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-amber-400 h-1.5 rounded-full" 
                    style={{ width: `${Math.min((t.frequency / (sortedTopics[0]?.frequency || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Keywords */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Hash className="w-5 h-5 text-rose-400" /> Core Keywords
        </h3>
        {sortedKeywords.length === 0 ? (
          <p className="text-gray-500 italic">No keywords extracted.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sortedKeywords.slice(0, 15).map((k, i) => (
              <span 
                key={i} 
                className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors border border-gray-600 cursor-default"
                title={`${k.frequency} mentions`}
              >
                {k.keyword}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

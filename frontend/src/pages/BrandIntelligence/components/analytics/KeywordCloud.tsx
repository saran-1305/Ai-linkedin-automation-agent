import React from 'react';

interface KeywordCloudProps {
  keywords: any[];
}

export const KeywordCloud: React.FC<KeywordCloudProps> = ({ keywords }) => {
  if (!keywords || keywords.length === 0) return null;

  // Sort by frequency
  const sorted = [...keywords].sort((a, b) => (b.frequency || 1) - (a.frequency || 1)).slice(0, 20);
  
  if (sorted.length === 0) return null;
  
  const maxFreq = Math.max(...sorted.map(k => k.frequency || 1));
  const minFreq = Math.min(...sorted.map(k => k.frequency || 1));
  
  // Calculate size relative to max and min (between 0.8rem and 2rem)
  const getFontSize = (freq: number) => {
    if (maxFreq === minFreq) return '1.2rem';
    const ratio = (freq - minFreq) / (maxFreq - minFreq);
    const size = 0.8 + (ratio * 1.5);
    return `${size}rem`;
  };

  // Calculate color intensity based on frequency
  const getOpacity = (freq: number) => {
    if (maxFreq === minFreq) return 1;
    const ratio = (freq - minFreq) / (maxFreq - minFreq);
    return 0.4 + (ratio * 0.6); // Between 40% and 100% opacity
  };

  return (
    <div className="w-full bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h4 className="text-sm font-semibold text-gray-400 mb-6">Keyword Density Cloud</h4>
      <div className="flex flex-wrap gap-4 items-center justify-center min-h-[160px]">
        {sorted.map((k, idx) => (
          <span 
            key={idx}
            className="font-bold text-blue-400 transition-all hover:text-blue-300 cursor-default"
            style={{ 
              fontSize: getFontSize(k.frequency || 1),
              opacity: getOpacity(k.frequency || 1)
            }}
            title={`Frequency: ${k.frequency || 1}`}
          >
            {k.keyword}
          </span>
        ))}
      </div>
    </div>
  );
};

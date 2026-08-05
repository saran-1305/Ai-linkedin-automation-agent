import React from 'react';
import { Mic, UserSquare2, Users } from 'lucide-react';

interface BrandIdentityProps {
  voice: any[];
  personality: any[];
  audiences: any[];
}

export const BrandIdentity: React.FC<BrandIdentityProps> = ({ voice, personality, audiences }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Brand Voice */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Mic className="w-5 h-5 text-emerald-400" /> Brand Voice
        </h3>
        {voice.length === 0 ? (
          <p className="text-gray-500 italic">No voice data extracted yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {voice.map((v, i) => (
              <span key={i} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-medium border border-emerald-500/20 flex items-center gap-2">
                {v.characteristic}
                <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">
                  {Math.round(v.confidence * 100)}%
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Personality */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <UserSquare2 className="w-5 h-5 text-orange-400" /> Personality Traits
        </h3>
        {personality.length === 0 ? (
          <p className="text-gray-500 italic">No personality data extracted yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {personality.map((p, i) => (
              <span key={i} className="px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg text-sm font-medium border border-orange-500/20 flex items-center gap-2">
                {p.trait}
                <span className="text-[10px] bg-orange-500/20 px-1.5 py-0.5 rounded text-orange-300">
                  {Math.round(p.confidence * 100)}%
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Target Audience */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" /> Target Audiences
        </h3>
        {audiences.length === 0 ? (
          <p className="text-gray-500 italic">No audience data extracted yet.</p>
        ) : (
          <div className="space-y-3">
            {audiences.map((a, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-medium">{a.segment}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${
                    a.type?.toLowerCase() === 'primary' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {a.type || 'Secondary'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

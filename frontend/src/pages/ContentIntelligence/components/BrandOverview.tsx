import React from 'react';
import { Target, Globe, Award, Briefcase, Zap } from 'lucide-react';

interface BrandOverviewProps {
  profile: any;
}

export const BrandOverview: React.FC<BrandOverviewProps> = ({ profile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Core Mission */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" /> Core Mission
        </h3>
        <p className="text-gray-300 text-lg leading-relaxed">
          {profile?.core_mission || profile?.business_summary || "Mission not established yet."}
        </p>
      </div>

      {/* Brand Vision */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" /> Brand Vision
        </h3>
        <p className="text-gray-300 leading-relaxed">
          {profile?.brand_vision || "Vision not established yet."}
        </p>
      </div>

      {/* Unique Value Proposition */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" /> Unique Value Proposition
        </h3>
        <p className="text-gray-300 leading-relaxed">
          {profile?.value_proposition || "UVP not established yet."}
        </p>
        {profile?.unique_selling_points && profile.unique_selling_points.length > 0 && (
          <ul className="mt-4 space-y-2">
            {(profile?.unique_selling_points || []).map((usp: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-gray-300">
                <span className="text-yellow-400 mt-1">•</span>
                <span>{usp}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Industry & Expertise */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
            <Briefcase className="w-4 h-4 text-purple-400" /> Industry
          </h3>
          <p className="text-white font-medium">{profile?.primary_industry || "Unknown"}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
            <Award className="w-4 h-4 text-pink-400" /> Primary Expertise
          </h3>
          <p className="text-white font-medium">{profile?.primary_expertise || "Unknown"}</p>
        </div>
      </div>
    </div>
  );
};

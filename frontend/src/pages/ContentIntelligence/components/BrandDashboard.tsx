import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useBrandIntelligence } from '../hooks/useBrandIntelligence';
import { BrandOverview } from './BrandOverview';
import { BrandConfidence } from './BrandConfidence';
import { BrandIdentity } from './BrandIdentity';
import { BrandContent } from './BrandContent';
import { BrandMechanics } from './BrandMechanics';
import { BrandVersions } from './BrandVersions';
import { ConfidenceTrendChart } from '../../BrandIntelligence/components/analytics/ConfidenceTrendChart';
import { TopicFrequencyChart } from '../../BrandIntelligence/components/analytics/TopicFrequencyChart';
import { AudienceDistributionChart } from '../../BrandIntelligence/components/analytics/AudienceDistributionChart';
import { KeywordCloud } from '../../BrandIntelligence/components/analytics/KeywordCloud';
import { GenerationTimeline } from '../../BrandIntelligence/components/analytics/GenerationTimeline';

export const BrandDashboard: React.FC = () => {
  const { 
    profile, voice, personality, pillars, topics, keywords, audiences, 
    vocabulary, storytelling, ctaPatterns, postingPatterns, versions,
    loading, regenerating, regenerateProfile 
  } = useBrandIntelligence();

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-gray-800 rounded-xl"></div>
        <div className="h-48 bg-gray-800 rounded-xl"></div>
        <div className="h-64 bg-gray-800 rounded-xl"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">No Brand Profile Yet</h3>
        <p className="text-gray-400 mb-6">Import documents to teach the AI about your brand, then regenerate the profile.</p>
        <button onClick={regenerateProfile} disabled={regenerating} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center mx-auto gap-2">
          {regenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {regenerating ? 'Aggregating...' : 'Generate Brand Profile'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 mb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Brand Intelligence</h2>
          <p className="text-gray-400">The single source of truth for your AI Agent.</p>
        </div>
        <button onClick={regenerateProfile} disabled={regenerating} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-gray-700 flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
          {regenerating ? 'Rebuilding...' : 'Regenerate Profile'}
        </button>
      </div>

      <section>
        <BrandConfidence confidenceScores={profile.confidence_scores} versions={versions} />
      </section>

      <section>
        <h3 className="text-xl font-bold text-white mb-4">Brand Strategy</h3>
        <BrandOverview profile={profile} />
      </section>

      <section>
        <h3 className="text-xl font-bold text-white mb-4">Brand Identity</h3>
        <BrandIdentity voice={voice} personality={personality} audiences={audiences} />
      </section>

      <section>
        <h3 className="text-xl font-bold text-white mb-4">Content Ecosystem</h3>
        <BrandContent pillars={pillars} topics={topics} keywords={keywords} />
      </section>

      <section>
        <h3 className="text-xl font-bold text-white mb-4">Execution Mechanics</h3>
        <BrandMechanics 
          vocabulary={vocabulary} 
          storytelling={storytelling} 
          ctaPatterns={ctaPatterns} 
          postingPatterns={postingPatterns} 
        />
      </section>

      <section>
        <h3 className="text-xl font-bold text-white mb-4">Analytics & Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ConfidenceTrendChart versions={versions} />
          <TopicFrequencyChart topics={topics} />
          <AudienceDistributionChart audiences={audiences} />
          <GenerationTimeline versions={versions} />
          <div className="md:col-span-2">
            <KeywordCloud keywords={keywords} />
          </div>
        </div>
      </section>

      <section>
        <BrandVersions versions={versions} />
      </section>
    </div>
  );
};

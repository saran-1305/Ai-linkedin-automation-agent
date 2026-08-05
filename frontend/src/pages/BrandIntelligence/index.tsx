import React from 'react';
import { useBrandIntelligence } from '../ContentIntelligence/hooks/useBrandIntelligence';
import { BrainHero } from './components/BrainHero';
import { BrandHealth } from './components/BrandHealth';
import { BrandIdentity } from './components/BrandIdentity';
import { TargetAudience } from './components/TargetAudience';
import { BrandVoice } from './components/BrandVoice';
import { MessagingFramework } from './components/MessagingFramework';
import { ContentPillars } from './components/ContentPillars';
import { Keywords } from './components/Keywords';
import { KnowledgeSources } from './components/KnowledgeSources';
import { VersionHistory } from './components/VersionHistory';
import { SmartInsights } from './components/SmartInsights';
import { Brain } from 'lucide-react';

const BrandIntelligencePage: React.FC = () => {
  const { 
    profile, voice, personality, pillars, topics, keywords, audiences, 
    vocabulary, storytelling, ctaPatterns, postingPatterns, versions,
    loading, regenerating, regenerateProfile, exportProfile
  } = useBrandIntelligence();

  const hasProfile = !!profile;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-text-muted animate-pulse">Initializing AI Brain...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in pb-24 max-w-7xl mx-auto">
      
      {/* Hero Section */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <BrainHero 
            regenerateProfile={regenerateProfile} 
            exportProfile={exportProfile}
            regenerating={regenerating} 
            hasProfile={hasProfile}
          />
        </div>
      </div>

      {hasProfile ? (
        <>
          {/* Brand Health Row */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <BrandHealth confidenceScores={profile.confidence_scores} />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column (8 columns) */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              <BrandIdentity profile={profile} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TargetAudience audiences={audiences} />
                <BrandVoice voice={voice} personality={personality} />
              </div>
              
              <MessagingFramework storytelling={storytelling} ctaPatterns={ctaPatterns} />
              <ContentPillars pillars={pillars} />
              <Keywords keywords={keywords} />
            </div>
            
            {/* Right Column (4 columns) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              <KnowledgeSources />
              <SmartInsights profile={profile} voice={voice} audiences={audiences} />
              <VersionHistory versions={versions} />
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <div className="border border-border border-dashed bg-transparent rounded-xl p-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6 shadow-sm">
                <Brain className="w-8 h-8 text-primary opacity-50" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">No AI Brain Generated</h3>
              <p className="text-text-secondary max-w-md mx-auto mb-8">
                Your AI Brand Brain has not been built yet. Import documents in Content Intelligence or complete your Business Profile first, then click "Build Brand Brain".
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandIntelligencePage;

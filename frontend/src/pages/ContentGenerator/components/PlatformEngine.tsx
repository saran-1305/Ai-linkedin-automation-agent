import React, { useState, useEffect } from 'react';
import { contentApi } from '../../../services/api/contentApi';
import type { PlatformContent } from '../../../services/api/contentApi';
import { Smartphone, RefreshCw, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface PlatformEngineProps {
  contentId: number;
}

const PLATFORMS = ['LinkedIn', 'X', 'Instagram', 'Blog', 'Newsletter'];

export const PlatformEngine: React.FC<PlatformEngineProps> = ({ contentId }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('LinkedIn');
  const [platformData, setPlatformData] = useState<PlatformContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeVariationIndex, setActiveVariationIndex] = useState(0);

  const fetchPlatformData = async (platform: string) => {
    setLoading(true);
    try {
      const { data } = await contentApi.getPlatformVariations(contentId, platform);
      setPlatformData(data);
    } catch (e) {
      console.error(e);
      setPlatformData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatformData(selectedPlatform);
    setActiveVariationIndex(0);
  }, [contentId, selectedPlatform]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await contentApi.generatePlatformContent(contentId, selectedPlatform);
      await fetchPlatformData(selectedPlatform);
    } catch (e) {
      console.error(e);
      alert('Failed to generate for platform');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Platform Tabs Header */}
      <div className="flex flex-wrap items-center bg-background border-b border-border px-2 pt-2 gap-1">
        <div className="px-3 py-2 text-xs font-bold text-text-muted flex items-center gap-2">
           <Smartphone className="w-4 h-4" /> Platform Variants
        </div>
        <div className="w-px h-4 bg-border mx-2" />
        {PLATFORMS.map(p => (
          <button
            key={p}
            onClick={() => setSelectedPlatform(p)}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all ${selectedPlatform === p
              ? 'bg-surface text-primary border-b-2 border-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover border-b-2 border-transparent'
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 relative">
        {loading ? (
          <div className="flex items-center justify-center h-48">
             <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : !platformData ? (
          <div className="flex flex-col items-center justify-center h-48 text-center bg-background rounded-lg border border-dashed border-border p-6">
            <FileText className="w-10 h-10 text-text-muted mb-3 opacity-50" />
            <p className="text-sm text-text-secondary font-medium mb-4">No content variant generated for {selectedPlatform} yet.</p>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              size="sm"
              className="gap-2 shadow-sm"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {generating ? 'Adapting Content...' : 'Generate Platform Variant'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Variations Area */}
            <div className="lg:col-span-8 flex flex-col h-full">
              {/* Variation Tabs */}
              {platformData.variations.length > 1 && (
                <div className="flex gap-2 mb-4 bg-background p-1 rounded-lg border border-border w-fit">
                  {platformData.variations.map((v, idx) => (
                    <button
                      key={v.id}
                      onClick={() => setActiveVariationIndex(idx)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${activeVariationIndex === idx
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                        }`}
                    >
                      {v.variation_label}
                    </button>
                  ))}
                </div>
              )}

              {/* Active Variation Content */}
              {platformData.variations[activeVariationIndex] && (
                <div className="bg-background rounded-xl border border-border p-6 shadow-inner flex-1">
                  {platformData.variations[activeVariationIndex].title && (
                    <h4 className="text-base font-bold text-text-primary mb-4 leading-snug">
                       {platformData.variations[activeVariationIndex].title}
                    </h4>
                  )}
                  <div className="prose prose-invert prose-sm max-w-none text-text-secondary whitespace-pre-wrap leading-relaxed font-medium">
                    {platformData.variations[activeVariationIndex].body}
                  </div>

                  {platformData.variations[activeVariationIndex].hashtags && platformData.variations[activeVariationIndex].hashtags.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2 text-primary font-medium text-sm">
                      {platformData.variations[activeVariationIndex].hashtags.map((t, i) => (
                        <span key={i}>#{t.replace('#', '')}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Sidebar: Rules & Optimization */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Optimization Score */}
              <div className="bg-background rounded-xl border border-border p-5 shadow-sm flex items-center justify-between">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Adaptation Score</h4>
                <div className="text-2xl font-black text-primary">
                  {platformData.variations[activeVariationIndex]?.optimization_score || 0}
                  <span className="text-sm text-text-muted">/100</span>
                </div>
              </div>

              {/* Platform Rules Validation */}
              <div className="bg-background rounded-xl border border-border p-5 shadow-sm">
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-4 border-b border-border pb-2">Platform Compliance</h4>
                <div className="space-y-3.5">
                  {platformData.variations[activeVariationIndex]?.rule_validations?.map((rule, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="mt-0.5 shrink-0">
                        {rule.is_valid === 1 ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <XCircle className="w-4 h-4 text-danger" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-text-primary leading-tight">{rule.rule_name}</div>
                        <div className="text-[10px] text-text-secondary mt-1 leading-relaxed font-medium">{rule.feedback}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

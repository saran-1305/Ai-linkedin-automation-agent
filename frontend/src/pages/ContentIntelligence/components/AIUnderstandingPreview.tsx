import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { BrainCircuit, Target, MessageCircle, Hash, Zap } from 'lucide-react';
import { contentImportService, type ContentImportData, type AnalysisData } from '../../../services/contentImportService';

interface AIUnderstandingPreviewProps {
  imports: ContentImportData[];
}

export const AIUnderstandingPreview: React.FC<AIUnderstandingPreviewProps> = ({ imports }) => {
  // @ts-ignore - analysis_status is on the payload now
  const readyImport = imports.find(i => i.analysis_status === 'Analyzed');
  const isReady = !!readyImport;
  
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (readyImport) {
      const fetchAnalysis = async () => {
        setIsLoading(true);
        try {
          const data = await contentImportService.getAnalysis(readyImport.id);
          setAnalysis(data);
        } catch (error) {
          console.error("Failed to fetch analysis", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAnalysis();
    }
  }, [readyImport?.id]);

  const confidenceScore = analysis ? Math.round(analysis.overall_confidence * 100) : 0;

  return (
    <Card className="border-border bg-surface mb-8 overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-border bg-background/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BrainCircuit className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">AI Understanding Preview</h2>
            <p className="text-sm text-text-secondary mt-1">What the AI has learned from your imported knowledge.</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-muted">Confidence Score</div>
          <div className={`text-2xl font-bold ${isReady && analysis ? 'text-emerald-500' : 'text-text-muted'}`}>
            {isReady && analysis ? `${confidenceScore}%` : '0%'}
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        {isReady && analysis ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Audiences Detected
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.audiences.slice(0, 3).map((aud, i) => (
                  <span key={i} className="px-2 py-1 bg-background border border-border rounded-md text-xs text-text-secondary">
                    {aud.segment}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" /> Writing Tone
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.tones.slice(0, 3).map((tone, i) => (
                  <span key={i} className="px-2 py-1 bg-background border border-border rounded-md text-xs text-text-secondary">
                    {tone.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" /> Content Pillars
              </h4>
              <div className="flex flex-col gap-2">
                {analysis.content_pillars.slice(0, 3).map((pillar, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {pillar}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Top Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.slice(0, 5).map((kw, i) => (
                  <span key={i} className="text-xs font-medium text-text-secondary bg-surface-hover px-2 py-1 rounded">
                    {kw.name.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="py-8 text-center text-text-muted text-sm">
            {isLoading ? "Loading AI analysis..." : "Import and process documents to see what the AI learns about your brand."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

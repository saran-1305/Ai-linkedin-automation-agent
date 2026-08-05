import React, { useEffect, useState } from 'react';
import { contentImportService, type AnalysisData } from '../../../services/contentImportService';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
}

export function AnalysisModal({ isOpen, onClose, documentId }: AnalysisModalProps) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && documentId) {
      loadAnalysis();
    }
  }, [isOpen, documentId]);

  const loadAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contentImportService.getAnalysis(documentId);
      setAnalysis(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Brand Knowledge Analysis</h2>
            {analysis && (
              <div className="flex items-center mt-2 space-x-3 text-sm">
                <span className="px-2 py-1 text-blue-400 bg-blue-500/10 rounded-md border border-blue-500/20">
                  {analysis.document_type}
                </span>
                <span className="text-gray-400">
                  Confidence: {Math.round(analysis.overall_confidence * 100)}%
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          ) : analysis ? (
            <div className="space-y-8">
              
              {/* Summary */}
              <section>
                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Executive Summary</h3>
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <p className="text-gray-200 leading-relaxed">{analysis.summary}</p>
                </div>
              </section>

              {/* Grid: Topics & Audiences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Key Topics</h3>
                  <div className="space-y-2">
                    {(analysis?.topics || []).map((topic, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-800">
                        <div>
                          <p className="text-white font-medium">{topic.name}</p>
                          <p className="text-xs text-gray-500">{topic.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-blue-400">{Math.round(topic.confidence * 100)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Target Audience</h3>
                  <div className="space-y-2">
                    {(analysis?.audiences || []).map((aud, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-800">
                        <p className="text-white">{aud.segment}</p>
                        <p className="text-xs text-blue-400">{Math.round(aud.confidence * 100)}%</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Badges: Styles, Tones, Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <section>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Tone of Voice</h3>
                  <div className="flex flex-wrap gap-2">
                    {(analysis?.tones || []).map((tone, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm border border-purple-500/20">
                        {tone.name}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Writing Style</h3>
                  <div className="flex flex-wrap gap-2">
                    {(analysis?.writing_styles || []).map((style, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm border border-emerald-500/20">
                        {style}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Content Pillars</h3>
                  <div className="flex flex-wrap gap-2">
                    {(analysis?.content_pillars || []).map((pillar, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-sm border border-amber-500/20">
                        {pillar}
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              {/* Keywords & CTAs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Keywords & Entities</h3>
                  <div className="flex flex-wrap gap-2">
                    {(analysis?.keywords || []).map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs border border-gray-700" title={kw.type}>
                        {kw.name}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Calls to Action</h3>
                  <div className="space-y-2">
                    {(analysis?.ctas || []).map((cta, i) => (
                      <div key={i} className="p-3 bg-gray-800/30 rounded-lg border border-gray-800">
                        <p className="text-white text-sm">"{cta.text}"</p>
                        <p className="text-xs text-gray-500 mt-1">{cta.type}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

            </div>
          ) : null}
        </div>
        
      </div>
    </div>
  );
}

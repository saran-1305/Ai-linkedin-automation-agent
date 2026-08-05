import React from 'react';
import { FileText, MessageSquare, Quote, MousePointerClick, AlignLeft } from 'lucide-react';

interface BrandMechanicsProps {
  vocabulary: any[];
  storytelling: any[];
  ctaPatterns: any[];
  postingPatterns: any;
}

export const BrandMechanics: React.FC<BrandMechanicsProps> = ({ vocabulary, storytelling, ctaPatterns, postingPatterns }) => {
  const preferredVocab = vocabulary.filter(v => v.category !== 'avoided').slice(0, 6);
  const avoidedVocab = vocabulary.filter(v => v.category === 'avoided').slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Content Strategy & Writing Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlignLeft className="w-5 h-5 text-teal-400" /> Writing Style & Strategy
          </h3>
          {!postingPatterns || Object.keys(postingPatterns).length === 0 ? (
            <p className="text-gray-500 italic">No writing style data extracted.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                <p className="text-xs text-gray-400 mb-1">Sentence Length</p>
                <p className="text-sm text-white font-medium">{postingPatterns.avg_sentence_length ? `${postingPatterns.avg_sentence_length} words` : 'Medium'}</p>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                <p className="text-xs text-gray-400 mb-1">Reading Difficulty</p>
                <p className="text-sm text-white font-medium">{postingPatterns.reading_difficulty || 'Accessible'}</p>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                <p className="text-xs text-gray-400 mb-1">Paragraph Structure</p>
                <p className="text-sm text-white font-medium">{postingPatterns.paragraph_structure || 'Standard'}</p>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                <p className="text-xs text-gray-400 mb-1">Technical Depth</p>
                <p className="text-sm text-white font-medium">{postingPatterns.technical_depth || 'Balanced'}</p>
              </div>
              {postingPatterns.content_strategy && postingPatterns.content_strategy.length > 0 && (
                <div className="col-span-2 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 mt-2">
                  <p className="text-xs text-gray-400 mb-2">Primary Content Strategies</p>
                  <div className="flex flex-wrap gap-2">
                    {(postingPatterns?.content_strategy || []).map((s: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vocabulary */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-fuchsia-400" /> Brand Vocabulary
          </h3>
          
          <div className="mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Preferred Terms & Expressions</p>
            {preferredVocab.length === 0 ? (
              <p className="text-sm text-gray-500">None extracted.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {preferredVocab.map((v, i) => (
                  <span key={i} className="px-2.5 py-1 bg-fuchsia-500/10 text-fuchsia-300 rounded border border-fuchsia-500/20 text-sm">
                    {v.word_or_phrase}
                  </span>
                ))}
              </div>
            )}
          </div>

          {avoidedVocab.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Avoided Terminology</p>
              <div className="flex flex-wrap gap-2">
                {avoidedVocab.map((v, i) => (
                  <span key={i} className="px-2.5 py-1 bg-red-500/10 text-red-300 rounded border border-red-500/20 text-sm line-through decoration-red-500/50">
                    {v.word_or_phrase}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Storytelling & CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Quote className="w-5 h-5 text-blue-400" /> Storytelling Patterns
          </h3>
          {storytelling.length === 0 ? (
            <p className="text-gray-500 italic">No storytelling patterns extracted.</p>
          ) : (
            <ul className="space-y-3">
              {storytelling.slice(0, 4).map((s, i) => (
                <li key={i} className="flex items-center gap-3 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                  <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{s.pattern_name}</p>
                    <p className="text-xs text-gray-400">Frequency: {s.frequency}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MousePointerClick className="w-5 h-5 text-green-400" /> Calls to Action
          </h3>
          {ctaPatterns.length === 0 ? (
            <p className="text-gray-500 italic">No CTAs extracted.</p>
          ) : (
            <ul className="space-y-3">
              {ctaPatterns.slice(0, 4).map((cta, i) => (
                <li key={i} className="flex items-center gap-3 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                  <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center text-green-400 font-bold shrink-0">
                    {cta.frequency}x
                  </div>
                  <p className="text-sm text-gray-300 italic">"{cta.cta_text}"</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

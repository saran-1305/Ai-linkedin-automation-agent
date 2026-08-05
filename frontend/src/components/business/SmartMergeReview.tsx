import React, { useState } from 'react';
import { Check, X, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface ExtractedField {
  value: any;
  confidence: number;
  source: string;
  explanation: string;
}

interface SmartMergeReviewProps {
  extractedData: Record<string, ExtractedField>;
  form: UseFormReturn<any>;
  onComplete: () => void;
}

const SmartMergeReview: React.FC<SmartMergeReviewProps> = ({ extractedData, form, onComplete }) => {
  const [decisions, setDecisions] = useState<Record<string, 'keep' | 'replace'>>({});

  const fields = Object.keys(extractedData).filter(key => 
    extractedData[key] && extractedData[key].value !== null && extractedData[key].value !== undefined
  );

  const handleDecision = (field: string, decision: 'keep' | 'replace') => {
    setDecisions(prev => ({ ...prev, [field]: decision }));
    
    if (decision === 'replace') {
      const val = extractedData[field].value;
      form.setValue(field, Array.isArray(val) ? val.join(', ') : val, { shouldDirty: true });
    }
  };

  const handleAcceptAll = () => {
    fields.forEach(field => {
      handleDecision(field, 'replace');
    });
    onComplete();
  };

  return (
    <div className="bg-surface border border-border rounded-xl shadow-xl p-6 w-full max-w-5xl mx-auto max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <span className="bg-primary/20 text-primary p-2 rounded-lg"><ArrowRightLeft className="w-6 h-6" /></span>
            Smart Merge Review
          </h2>
          <p className="text-text-secondary mt-1">Review the data AI extracted from your files. Choose what to keep or replace.</p>
        </div>
        <button 
          onClick={handleAcceptAll}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition"
        >
          Accept All Changes
        </button>
      </div>

      <div className="space-y-6">
        {fields.map(field => {
          const currentVal = form.getValues(field);
          const newVal = extractedData[field].value;
          const displayCurrent = Array.isArray(currentVal) ? currentVal.join(', ') : (currentVal || 'Empty');
          const displayNew = Array.isArray(newVal) ? newVal.join(', ') : (newVal || 'Empty');
          const isDecided = decisions[field];
          
          if (displayCurrent === displayNew && currentVal) return null; // No difference

          return (
            <div key={field} className={`border rounded-xl p-4 transition-all ${isDecided ? 'border-primary/50 bg-primary/5' : 'border-border bg-background'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-text-primary capitalize text-lg">{field.replace(/_/g, ' ')}</h3>
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${extractedData[field].confidence > 0.8 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {(extractedData[field].confidence * 100).toFixed(0)}% Match
                  </span>
                  <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded-full border border-slate-700 flex items-center gap-1">
                    Source: {extractedData[field].source}
                  </span>
                </div>
              </div>
              
              {extractedData[field].explanation && (
                <p className="text-sm text-text-muted mb-4 italic flex items-start gap-1">
                  <AlertCircle className="w-4 h-4 inline mt-0.5 text-primary/70" />
                  {extractedData[field].explanation}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Current Value */}
                <div className="border border-slate-700 rounded-lg p-3 bg-slate-900/50 relative">
                  <span className="absolute -top-2.5 left-3 bg-background px-1 text-xs text-text-muted font-medium">Current Value</span>
                  <p className="text-text-secondary text-sm mt-1 line-clamp-3">{displayCurrent}</p>
                  
                  <button 
                    onClick={() => handleDecision(field, 'keep')}
                    className={`mt-3 w-full py-1.5 rounded text-sm font-medium transition ${decisions[field] === 'keep' ? 'bg-slate-700 text-white' : 'border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    Keep Current
                  </button>
                </div>

                {/* Extracted Value */}
                <div className="border border-primary/30 rounded-lg p-3 bg-primary/5 relative">
                  <span className="absolute -top-2.5 left-3 bg-background px-1 text-xs text-primary font-medium flex items-center gap-1">
                    AI Extracted
                  </span>
                  <p className="text-text-primary text-sm mt-1 line-clamp-3">{displayNew}</p>
                  
                  <button 
                    onClick={() => handleDecision(field, 'replace')}
                    className={`mt-3 w-full py-1.5 rounded text-sm font-medium transition flex items-center justify-center gap-1 ${decisions[field] === 'replace' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'border border-primary/50 text-primary hover:bg-primary/10'}`}
                  >
                    <Check className="w-4 h-4" /> Use New Value
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 flex justify-end gap-3 border-t border-border pt-4">
        <button 
          onClick={onComplete}
          className="px-6 py-2 border border-border text-text-primary rounded-lg font-medium hover:bg-surface-hover transition"
        >
          Skip Remaining
        </button>
        <button 
          onClick={onComplete}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition shadow-lg shadow-primary/20"
        >
          Finish Review
        </button>
      </div>
    </div>
  );
};

export default SmartMergeReview;

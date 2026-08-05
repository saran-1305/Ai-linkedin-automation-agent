import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { FileText, File, Link, FileCode, FileSpreadsheet, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { type ImportStep } from '../hooks/useContentImport';

const SUPPORTED_SOURCES = [
  { id: 'Paste Text', icon: FileText, desc: 'Directly paste content', disabled: false },
  { id: 'PDF', icon: File, desc: 'Upload PDF files', disabled: false },
  { id: 'DOCX', icon: FileText, desc: 'Upload Word documents', disabled: false },
  { id: 'Markdown', icon: FileCode, desc: 'Upload Markdown files', disabled: false },
  { id: 'CSV', icon: FileSpreadsheet, desc: 'Upload spreadsheet data', disabled: false },
  { id: 'Website URL', icon: Link, desc: 'Scrape a public URL', disabled: false },
  { id: 'LinkedIn', icon: Link, desc: 'Import posts', disabled: true },
  { id: 'Notion', icon: FileText, desc: 'Connect workspace', disabled: true },
  { id: 'Google Docs', icon: FileText, desc: 'Connect Drive', disabled: true }
];

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: ImportStep;
  selectedSource: string | null;
  setSelectedSource: (s: string) => void;
  file: File | null;
  setFile: (f: File | null) => void;
  url: string;
  setUrl: (u: string) => void;
  text: string;
  setText: (t: string) => void;
  error: string | null;
  handleNext: () => void;
  submitImport: () => void;
  isProcessing: boolean;
  setCurrentStep: (s: ImportStep) => void;
}

export const ImportWizard: React.FC<ImportWizardProps> = ({
  isOpen, onClose, currentStep, selectedSource, setSelectedSource,
  file, setFile, url, setUrl, text, setText, error, handleNext, submitImport, isProcessing, setCurrentStep
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-2xl border-border shadow-2xl">
        <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
          <CardTitle>Import Brand Knowledge</CardTitle>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">&times;</button>
        </CardHeader>
        <CardContent className="p-6">
          
          {/* Step 1: Select Source */}
          {currentStep === 'select' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-secondary">Choose a content source</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SUPPORTED_SOURCES.map(source => {
                  const Icon = source.icon;
                  return (
                    <button
                      key={source.id}
                      disabled={source.disabled}
                      onClick={() => setSelectedSource(source.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all",
                        source.disabled ? "border-border/50 bg-surface/50 opacity-50 cursor-not-allowed" :
                        selectedSource === source.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface hover:border-primary/50"
                      )}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <div className="text-sm font-semibold">{source.id}</div>
                      <div className="text-xs text-text-muted mt-1 leading-tight">{source.disabled ? "Coming Soon" : source.desc}</div>
                      {source.disabled && <Lock className="w-3 h-3 absolute top-2 right-2 text-text-muted" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Input */}
          {currentStep === 'input' && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <h3 className="text-sm font-medium text-text-secondary">Configure {selectedSource}</h3>
              
              {['PDF', 'DOCX', 'Markdown', 'CSV'].includes(selectedSource || '') && (
                <div 
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center flex flex-col items-center justify-center bg-surface-hover cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <File className="w-8 h-8 text-text-muted mb-3 pointer-events-none" />
                  <p className="text-sm font-medium mb-1 pointer-events-none">Click or drag file to upload</p>
                  <p className="text-xs text-text-muted mb-4 pointer-events-none">Maximum file size 10MB</p>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    accept={selectedSource === 'PDF' ? '.pdf' : selectedSource === 'CSV' ? '.csv' : undefined}
                  />
                  {file && <div className="mt-2 text-sm text-success font-medium">Selected: {file.name}</div>}
                </div>
              )}

              {selectedSource === 'Website URL' && (
                <Input
                  label="Website URL"
                  placeholder="https://company.com/blog/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              )}

              {selectedSource === 'Paste Text' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Paste your content</label>
                  <textarea
                    className="w-full h-48 bg-transparent border border-border rounded-md p-3 text-sm focus-ring resize-none"
                    placeholder="Paste your text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              )}

              {error && <div className="text-sm text-danger mt-2 bg-danger/10 p-2 rounded">{error}</div>}
            </div>
          )}

          {/* Step 3: Summary */}
          {currentStep === 'summary' && (
            <div className="space-y-4 animate-in zoom-in-95">
              <div className="p-4 rounded-xl border border-success/30 bg-success/5 text-center">
                <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                <h3 className="font-semibold text-text-primary">Ready to Import</h3>
                <p className="text-sm text-text-secondary mt-1">
                  The file will be uploaded securely and prepared for future AI analysis.
                </p>
              </div>
              
              <div className="bg-surface rounded-lg p-4 border border-border space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-muted">Source Type</span><span className="font-medium">{selectedSource}</span></div>
                {file && <div className="flex justify-between"><span className="text-text-muted">Filename</span><span className="font-medium">{file.name}</span></div>}
                {file && <div className="flex justify-between"><span className="text-text-muted">Size</span><span className="font-medium">{(file.size / 1024).toFixed(1)} KB</span></div>}
                {url && <div className="flex justify-between"><span className="text-text-muted">Target URL</span><span className="font-medium truncate max-w-[200px]">{url}</span></div>}
                {text && <div className="flex justify-between"><span className="text-text-muted">Word Count</span><span className="font-medium">{text.split(' ').length} words</span></div>}
                <div className="flex justify-between pt-2 border-t border-border mt-2"><span className="text-text-muted">Est. Processing</span><span className="font-medium">Instant</span></div>
              </div>
              
              {error && <div className="text-sm text-danger mt-2 bg-danger/10 p-2 rounded">{error}</div>}
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
            <Button variant="ghost" onClick={currentStep === 'select' ? onClose : () => setCurrentStep(currentStep === 'summary' ? 'input' : 'select')}>
              {currentStep === 'select' ? 'Cancel' : 'Back'}
            </Button>
            {currentStep === 'summary' ? (
              <Button onClick={submitImport} disabled={isProcessing}>
                {isProcessing ? 'Importing...' : 'Start Import'}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!selectedSource}>
                Next Step
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

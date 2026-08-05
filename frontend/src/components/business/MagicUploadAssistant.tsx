import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, Loader } from 'lucide-react';
import { businessApi } from '../../services/api/businessApi';

interface MagicUploadAssistantProps {
  onExtractionComplete: (data: any) => void;
}

const MagicUploadAssistant: React.FC<MagicUploadAssistantProps> = ({ onExtractionComplete }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(f => 
        ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(f.type) ||
        f.name.endsWith('.pdf') || f.name.endsWith('.pptx') || f.name.endsWith('.docx') || f.name.endsWith('.txt')
      );
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startExtraction = async () => {
    if (files.length === 0) return;
    
    try {
      setStatus('uploading');
      setProgress(10);
      
      const { task_id } = await businessApi.startExtraction(files);
      setStatus('processing');
      setProgress(40);
      
      // Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const taskStatus = await businessApi.getExtractionStatus(task_id);
          
          if (taskStatus.status === 'completed') {
            clearInterval(pollInterval);
            setStatus('success');
            setProgress(100);
            onExtractionComplete(taskStatus.result);
          } else if (taskStatus.status === 'failed') {
            clearInterval(pollInterval);
            setStatus('error');
            setErrorMsg(taskStatus.error || 'Extraction failed');
          } else {
            // still processing
            setProgress(prev => Math.min(prev + 5, 90));
          }
        } catch (err) {
          clearInterval(pollInterval);
          setStatus('error');
          setErrorMsg('Failed to check task status');
        }
      }, 2000);
      
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to upload files');
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-2xl mx-auto shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Magic Identity Extraction</h2>
        <p className="text-text-secondary">Upload your pitch decks, brand guidelines, or marketing materials and we'll automatically generate your Business Profile.</p>
      </div>

      <div 
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-background'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-text-muted'}`} />
        <h3 className="text-lg font-semibold text-text-primary mb-1">Drag & drop files here</h3>
        <p className="text-sm text-text-secondary mb-4">Support for PDF, PPTX, DOCX, TXT (Max 20MB per file)</p>
        <button className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/20 transition-colors">
          Browse Files
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          multiple 
          accept=".pdf,.pptx,.docx,.txt"
        />
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Selected Files</h4>
          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between bg-background border border-border p-3 rounded-lg">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-text-primary truncate">{file.name}</span>
                  <span className="text-xs text-text-muted flex-shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="text-text-muted hover:text-red-500 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {status !== 'idle' && (
        <div className="mt-6 p-4 border border-border rounded-lg bg-background">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary flex items-center">
              {status === 'uploading' && <><Loader className="w-4 h-4 mr-2 animate-spin text-primary" /> Uploading...</>}
              {status === 'processing' && <><Loader className="w-4 h-4 mr-2 animate-spin text-primary" /> AI is reading your files...</>}
              {status === 'success' && <><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Extraction Complete!</>}
              {status === 'error' && <><X className="w-4 h-4 mr-2 text-red-500" /> Error: {errorMsg}</>}
            </span>
            <span className="text-sm text-text-secondary">{progress}%</span>
          </div>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${status === 'error' ? 'bg-red-500' : 'bg-primary'}`} 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={startExtraction}
          disabled={files.length === 0 || status === 'uploading' || status === 'processing'}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center shadow-lg shadow-primary/20"
        >
          {status === 'processing' || status === 'uploading' ? 'Processing...' : 'Extract Identity'}
        </button>
      </div>
    </div>
  );
};

export default MagicUploadAssistant;

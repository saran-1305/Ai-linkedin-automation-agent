import { useState, useEffect } from 'react';
import { contentImportService, type ContentImportData } from '../../../services/contentImportService';

export type ImportStep = 'select' | 'input' | 'validate' | 'summary';

export const useContentImport = () => {
  const [imports, setImports] = useState<ContentImportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<ImportStep>('select');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  
  // Payload State
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  
  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImports = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await contentImportService.getImports();
      setImports(data);
    } catch (err) {
      console.error('Failed to fetch imports', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImports();
    const interval = setInterval(() => {
      fetchImports(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const openWizard = () => {
    resetWizard();
    setIsWizardOpen(true);
  };

  const closeWizard = () => setIsWizardOpen(false);

  const resetWizard = () => {
    setCurrentStep('select');
    setSelectedSource(null);
    setFile(null);
    setUrl('');
    setText('');
    setError(null);
  };

  const validateInput = (): boolean => {
    setError(null);
    if (!selectedSource) return false;
    
    if (['PDF', 'DOCX', 'Markdown', 'CSV'].includes(selectedSource)) {
      if (!file) {
        setError('Please select a file.');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File is too large. Maximum size is 10MB.');
        return false;
      }
    } else if (selectedSource === 'Website URL') {
      if (!url || !url.startsWith('http')) {
        setError('Please enter a valid URL starting with http:// or https://');
        return false;
      }
    } else if (selectedSource === 'Paste Text') {
      if (!text || text.length < 10) {
        setError('Please paste at least a few words of text.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 'select' && selectedSource) setCurrentStep('input');
    else if (currentStep === 'input') {
      if (validateInput()) {
        setCurrentStep('summary'); // skip validate step visually, jump to summary
      }
    }
  };

  const submitImport = async () => {
    if (!selectedSource) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      await contentImportService.importContent(selectedSource, {
        file: file || undefined,
        url: url || undefined,
        text_content: text || undefined
      });
      
      await fetchImports();
      closeWizard();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to import content.');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteImport = async (id: number) => {
    try {
      await contentImportService.deleteImport(id);
      await fetchImports();
    } catch (err) {
      console.error('Failed to delete import', err);
    }
  };

  return {
    imports,
    isLoading,
    isWizardOpen,
    currentStep,
    selectedSource,
    file,
    url,
    text,
    isProcessing,
    error,
    openWizard,
    closeWizard,
    setSelectedSource,
    setFile,
    setUrl,
    setText,
    handleNext,
    submitImport,
    deleteImport,
    setCurrentStep
  };
};

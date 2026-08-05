import React from 'react';
import { useContentImport } from './hooks/useContentImport';
import { ImportWizard } from './components/ImportWizard';

import { ContentHero } from './components/ContentHero';
import { AIKnowledgeStatus } from './components/AIKnowledgeStatus';
import { ImportSources } from './components/ImportSources';
import { KnowledgeLibrary } from './components/KnowledgeLibrary';
import { ProcessingPipeline } from './components/ProcessingPipeline';
import { AIUnderstandingPreview } from './components/AIUnderstandingPreview';
import { RightSidebar } from './components/RightSidebar';
import { EmptyState } from './components/EmptyState';

const ContentIntelligencePage: React.FC = () => {
  const {
    imports,
    isWizardOpen,
    currentStep,
    selectedSource,
    file,
    url,
    text,
    error,
    isProcessing,
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
  } = useContentImport();

  const handleSelectSource = (source: string) => {
    setSelectedSource(source);
    setCurrentStep('input');
    openWizard();
  };

  const hasImports = imports.length > 0;

  return (
    <div className="space-y-6 animate-in pb-24 max-w-7xl mx-auto">
      
      {/* Hero Section (12 columns) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <ContentHero imports={imports} isProcessing={isProcessing} />
        </div>
      </div>

      {/* AI Knowledge Status (12 columns) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <AIKnowledgeStatus imports={imports} />
        </div>
      </div>

      {/* Main Workspace (8) + Sidebar (4) */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <ProcessingPipeline />
          <ImportSources onSelectSource={handleSelectSource} />
          
          {hasImports ? (
            <KnowledgeLibrary imports={imports} onDelete={deleteImport} />
          ) : (
            <EmptyState onOpenWizard={openWizard} />
          )}
        </div>
        
        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-20">
            <RightSidebar imports={imports} />
          </div>
        </div>
      </div>

      {/* AI Understanding Preview (12 columns) */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <AIUnderstandingPreview imports={imports} />
        </div>
      </div>

      <ImportWizard
        isOpen={isWizardOpen}
        onClose={closeWizard}
        currentStep={currentStep}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
        file={file}
        setFile={setFile}
        url={url}
        setUrl={setUrl}
        text={text}
        setText={setText}
        error={error}
        handleNext={handleNext}
        submitImport={submitImport}
        isProcessing={isProcessing}
        setCurrentStep={setCurrentStep}
      />
    </div>
  );
};

export default ContentIntelligencePage;

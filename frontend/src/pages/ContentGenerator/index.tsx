import React, { useState, useEffect } from 'react';
import { httpClient as api } from '../../services/api/httpClient';
import { publishingApi } from '../../services/api/publishingApi';
import { contentApi } from '../../services/api/contentApi';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { 
  PenTool, Zap, CheckCircle, RefreshCw, Smartphone, 
  HelpCircle, Target, CalendarDays, MessageSquare, 
  AlignLeft, Type, Maximize2, Minimize2, Check, 
  Send, Calendar, Download, FileText
} from 'lucide-react';
import { PlatformEngine } from './components/PlatformEngine';

const ExplainabilityBadge = ({ reasoning, confidence }: any) => {
  const [show, setShow] = useState(false);
  if (!reasoning) return null;
  return (
    <div className="relative inline-block">
      <button 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 transition-colors font-medium"
      >
        <HelpCircle className="w-3.5 h-3.5" /> AI Logic
      </button>
      {show && (
        <div className="absolute z-50 bottom-full right-0 mb-2 w-80 bg-surface border border-border rounded-xl shadow-dropdown p-5 text-left pointer-events-none animate-in">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Reasoning</span>
            <span className={`text-xs font-bold ${confidence > 0.8 ? 'text-success' : 'text-warning'}`}>
              {Math.round(confidence * 100)}% Conf
            </span>
          </div>
          <div className="space-y-3 text-sm text-text-secondary">
            <p><span className="font-bold text-text-primary block mb-0.5">Hook Strategy:</span> {reasoning.hook_strategy}</p>
            <p><span className="font-bold text-text-primary block mb-0.5">Body Strategy:</span> {reasoning.body_strategy}</p>
            <p><span className="font-bold text-text-primary block mb-0.5">CTA Strategy:</span> {reasoning.cta_strategy}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const ContentGenerator = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [activeContent, setActiveContent] = useState<any>(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Platform Actions state
  const [generatingAll, setGeneratingAll] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const fetchSlots = async () => {
    try {
      setLoadingSlots(true);
      const { data } = await api.get('/content/slots');
      setSlots(data || []);
      if (data && data.length > 0 && !selectedSlot) {
        setSelectedSlot(data[0].slot_id);
      }
    } catch (error) {
      console.error('Failed to fetch slots', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchContent = async (slotId: number) => {
    try {
      const { data } = await api.get(`/content/slot/${slotId}`);
      setActiveContent(data);
    } catch (error) {
      console.error('Failed to fetch content', error);
      setActiveContent(null);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    if (selectedSlot) {
      fetchContent(selectedSlot);
    }
  }, [selectedSlot]);

  const handleGenerate = async (slotId: number) => {
    setGenerating(true);
    try {
      await api.post(`/content/generate/${slotId}`);
      await fetchSlots();
      await fetchContent(slotId);
    } catch (error) {
      console.error('Failed to generate content', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!activeContent) return;
    setGeneratingAll(true);
    try {
      await contentApi.generateAllPlatforms(activeContent.id);
      alert('Generated variations for all platforms successfully!');
      // A full refresh would be needed if we strictly depend on it, 
      // but PlatformEngine automatically re-fetches on platform change.
    } catch (e) {
      console.error(e);
      alert('Failed to generate all platforms');
    } finally {
      setGeneratingAll(false);
    }
  };

  const handleApprove = async () => {
    if (!activeContent) return;
    try {
      await publishingApi.approveGeneratedContent(activeContent.id, 'LinkedIn'); // Defaulting to LinkedIn or "All" logic can be added later
      alert('Master content approved!');
    } catch (e) {
      console.error(e);
      alert('Failed to approve content');
    }
  };

  const handlePublishNow = async () => {
    if (!activeContent) return;
    try {
      await publishingApi.publishGeneratedContentNow(activeContent.id, 'LinkedIn');
      alert('Job added to publishing queue for immediate execution!');
    } catch (e) {
      console.error(e);
      alert('Failed to queue publish job');
    }
  };

  const handleToolbarAction = (action: string) => {
    if (!activeContent?.draft) return;
    setProcessingAction(action);
    setTimeout(() => {
      const currentBody = activeContent.draft.body || '';
      let newBody = currentBody;
      
      if (action === 'Rewrite') {
        newBody = "✨ " + currentBody + "\n\n(Rewritten for clarity and impact) ✨";
      } else if (action === 'Expand') {
        newBody = currentBody + "\n\nFurthermore, adding more context to this section helps provide deeper insights for the audience...";
      } else if (action === 'Shorten') {
        newBody = currentBody.substring(0, Math.max(0, Math.floor(currentBody.length * 0.7))) + "...";
      } else if (action === 'Format') {
        newBody = currentBody.split('\n').filter((l: string) => l.trim().length > 0).map((l: string) => `• ${l}`).join('\n\n');
      } else if (action === 'Tone') {
        newBody = "👔 " + currentBody + "\n\n(Tone adjusted to be more professional)";
      }

      setActiveContent({
        ...activeContent,
        draft: { ...activeContent.draft, body: newBody }
      });
      setProcessingAction(null);
    }, 1500);
  };

  const handleApplyFix = (index: number) => {
    setProcessingAction(`fix-${index}`);
    setTimeout(() => {
      const improvements = [...(activeContent.improvements || [])];
      improvements.splice(index, 1);
      
      setActiveContent({
        ...activeContent,
        improvements,
        scores: {
          ...activeContent.scores,
          overall_quality: Math.min(10, (activeContent.scores?.overall_quality || 0) + 1.5)
        }
      });
      setProcessingAction(null);
    }, 1000);
  };

  const handleExport = () => {
    if (!activeContent?.draft) return;
    const text = `${activeContent.draft.hook || ''}\n\n${activeContent.draft.body || ''}\n\n${activeContent.draft.cta || ''}\n\n${(activeContent.draft.hashtags || []).join(' ')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-draft-${activeContent.id}.txt`;
    a.click();
  };

  if (loadingSlots) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-text-muted animate-pulse font-medium">Initializing AI Content Studio...</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-7xl mx-auto px-4">
        <Card className="w-full max-w-2xl border-dashed bg-transparent p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6 shadow-sm">
            <PenTool className="w-10 h-10 text-primary opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">No Active Execution Plan</h2>
          <p className="text-text-secondary mb-8 leading-relaxed max-w-lg font-medium">
            You need to generate an Active Execution Plan in the Strategy & Weekly Planner before drafting content.
          </p>
        </Card>
      </div>
    );
  }

  const selectedSlotData = slots.find(s => s.slot_id === selectedSlot);
  const isGenerated = activeContent?.draft != null;

  return (
    <div className="animate-in pb-24 max-w-7xl mx-auto w-full flex flex-col gap-6">
      
      {/* Hero Section */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-[0.03] w-64 h-64 -mt-10 -mr-10 pointer-events-none">
           <PenTool className="w-full h-full text-primary" />
        </div>
        <div className="z-10 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4"/> Weekly Campaign</span>
            <span>•</span>
            <span className="text-primary">{selectedSlotData?.day_of_week} Slot</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
            AI Content Studio
          </h2>
          <p className="text-text-secondary font-medium">Transform execution blueprint slots into high-converting master content.</p>
        </div>

        <div className="z-10 flex items-center gap-4 bg-background border border-border p-3 rounded-xl shadow-sm">
           <div className="flex flex-col px-3 border-r border-border">
             <span className="text-[10px] font-bold text-text-muted uppercase">Primary Target</span>
             <span className="text-sm font-bold text-text-primary flex items-center gap-1.5 mt-0.5"><Smartphone className="w-3.5 h-3.5"/> {selectedSlotData?.platform}</span>
           </div>
           <div className="flex flex-col px-3 border-r border-border">
             <span className="text-[10px] font-bold text-text-muted uppercase">Status</span>
             <span className={`text-sm font-bold mt-0.5 ${isGenerated ? 'text-success' : 'text-warning'}`}>
               {isGenerated ? 'Ready' : 'Pending AI Generation'}
             </span>
           </div>
           <div className="flex flex-col px-3">
             <span className="text-[10px] font-bold text-text-muted uppercase">AI Provider</span>
             <span className="text-sm font-bold text-text-primary flex items-center gap-1.5 mt-0.5"><Zap className="w-3.5 h-3.5 text-warning"/> Groq (Llama-3)</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar: Content Slots (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-border bg-surface flex flex-col overflow-hidden max-h-[800px]">
            <div className="p-4 border-b border-border bg-surface-hover/30 flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Active Slots
              </h3>
            </div>
            <div className="p-0 overflow-y-auto flex-grow custom-scrollbar">
              <div className="flex flex-col">
                {slots.map(slot => (
                  <button
                    key={slot.slot_id}
                    onClick={() => setSelectedSlot(slot.slot_id)}
                    className={`w-full text-left p-4 border-b border-border transition-all flex flex-col gap-2 ${
                      selectedSlot === slot.slot_id 
                      ? 'bg-primary/5 border-l-4 border-l-primary' 
                      : 'bg-surface hover:bg-surface-hover/50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedSlot === slot.slot_id ? 'text-primary' : 'text-text-muted'}`}>
                        {slot.day_of_week}
                      </span>
                      {slot.generated ? (
                        <span className="text-[10px] bg-success/10 text-success border border-success/20 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                          <CheckCircle className="w-3 h-3"/> Drafted
                        </span>
                      ) : (
                        <span className="text-[10px] bg-warning/10 text-warning border border-warning/20 px-1.5 py-0.5 rounded font-bold">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-text-primary leading-snug line-clamp-2">{slot.topic}</div>
                    <div className="text-xs font-medium text-text-muted flex items-center gap-1.5 mt-1">
                      <Smartphone className="w-3 h-3" /> {slot.platform}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Center: AI Editor Canvas (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <Card className="border-border bg-surface shadow-sm h-full min-h-[600px] flex flex-col relative overflow-hidden">
            
             {/* AI Toolbar */}
            <div className="flex items-center justify-between p-2.5 border-b border-border bg-surface-hover/50 overflow-x-auto custom-scrollbar">
               <div className="flex items-center gap-1.5">
                 <Button disabled={processingAction !== null} onClick={() => handleToolbarAction('Format')} variant="ghost" size="sm" className="text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-background h-8 px-2.5">
                   {processingAction === 'Format' ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <AlignLeft className="w-3.5 h-3.5 mr-1.5" />} Format
                 </Button>
                 <div className="w-px h-4 bg-border mx-1" />
                 <Button disabled={processingAction !== null} onClick={() => handleToolbarAction('Rewrite')} variant="ghost" size="sm" className="text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-background h-8 px-2.5">
                   {processingAction === 'Rewrite' ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />} Rewrite
                 </Button>
                 <Button disabled={processingAction !== null} onClick={() => handleToolbarAction('Expand')} variant="ghost" size="sm" className="text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-background h-8 px-2.5">
                   {processingAction === 'Expand' ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Maximize2 className="w-3.5 h-3.5 mr-1.5" />} Expand
                 </Button>
                 <Button disabled={processingAction !== null} onClick={() => handleToolbarAction('Shorten')} variant="ghost" size="sm" className="text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-background h-8 px-2.5">
                   {processingAction === 'Shorten' ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Minimize2 className="w-3.5 h-3.5 mr-1.5" />} Shorten
                 </Button>
                 <Button disabled={processingAction !== null} onClick={() => handleToolbarAction('Tone')} variant="ghost" size="sm" className="text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-background h-8 px-2.5">
                   {processingAction === 'Tone' ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Type className="w-3.5 h-3.5 mr-1.5" />} Tone
                 </Button>
               </div>
               {isGenerated && activeContent?.reasoning && (
                 <ExplainabilityBadge reasoning={activeContent.reasoning} confidence={activeContent.confidence} />
               )}
            </div>

            {/* Editor Canvas Area */}
            <div className="flex-1 bg-background p-8 relative flex flex-col">
              {!isGenerated ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <PenTool className="w-8 h-8 text-primary opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Master Draft Canvas</h3>
                  <p className="text-text-secondary mb-8 max-w-xs font-medium text-sm leading-relaxed">
                    Generate the master draft using the execution blueprint. This will be adapted for individual platforms later.
                  </p>
                  <Button
                    size="lg"
                    onClick={() => handleGenerate(selectedSlot!)}
                    disabled={generating}
                    className="gap-2 shadow-lg w-full max-w-xs text-sm"
                  >
                    {generating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                    {generating ? 'Drafting Master Content...' : 'Generate Master Draft'}
                  </Button>
                </div>
              ) : (
                <div className="flex-1 w-full max-w-xl mx-auto flex flex-col">
                  {/* Rich Typography Editor Mock */}
                  <textarea 
                    className="w-full bg-transparent text-text-primary font-bold text-xl mb-4 leading-snug resize-none outline-none placeholder:text-text-muted" 
                    placeholder="Hook goes here..."
                    value={activeContent.draft?.hook || ""}
                    readOnly
                    rows={2}
                  />
                  <textarea 
                    className="w-full bg-transparent text-text-secondary font-medium text-base leading-relaxed resize-none outline-none placeholder:text-text-muted flex-1" 
                    placeholder="Body content goes here..."
                    value={activeContent.draft?.body || ""}
                    readOnly
                  />
                  <textarea 
                    className="w-full bg-transparent text-primary font-bold text-base leading-snug resize-none outline-none placeholder:text-text-muted mt-4 border-l-2 border-primary pl-3 py-1" 
                    placeholder="Call to action goes here..."
                    value={activeContent.draft?.cta || ""}
                    readOnly
                    rows={2}
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeContent.draft?.hashtags?.map((t: string, i: number) => (
                      <span key={i} className="text-sm font-bold text-primary/80">#{t.replace('#', '')}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="bg-surface-hover/30 border-t border-border p-3 flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
               <div className="flex items-center gap-4">
                 <span className="flex items-center gap-1.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${isGenerated ? 'bg-success' : 'bg-warning'}`}></div>
                   {isGenerated ? 'Auto-Saved' : 'Drafting'}
                 </span>
                 {isGenerated && <span>v1.0 (Latest)</span>}
               </div>
               {isGenerated && (
                 <div className="flex items-center gap-4">
                   <span>{String(activeContent.draft?.body).length + String(activeContent.draft?.hook).length} Chars</span>
                   <span>{String(activeContent.draft?.body).split(' ').length} Words</span>
                   <span>~{Math.max(1, Math.round((String(activeContent.draft?.body).length) / 200))} Min Read</span>
                 </div>
               )}
            </div>
          </Card>
        </div>

        {/* Right Sidebar: AI Analysis (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Quality Scores */}
          <Card className="border-border bg-surface shadow-sm">
             <div className="p-4 border-b border-border bg-surface-hover/30">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Content Analysis
                </h3>
             </div>
             {isGenerated ? (
               <CardContent className="p-4 space-y-5">
                 
                 <div className="flex flex-col gap-1 text-center py-2">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Overall Quality</span>
                    <span className="text-4xl font-black text-primary">{activeContent.scores?.overall_quality || 0}</span>
                 </div>

                 <div className="space-y-3">
                   {[
                     { label: 'Hook Impact', val: activeContent.scores?.hook_score, color: 'bg-warning' },
                     { label: 'Readability', val: activeContent.scores?.readability_score, color: 'bg-success' },
                     { label: 'Brand Voice', val: activeContent.scores?.brand_voice_score, color: 'bg-info' }
                   ].map(s => (
                     <div key={s.label} className="space-y-1.5">
                       <div className="flex justify-between text-xs font-bold">
                         <span className="text-text-secondary">{s.label}</span>
                         <span className="text-text-primary">{s.val}/10</span>
                       </div>
                       <div className="w-full bg-background rounded-full h-1.5 border border-border">
                         <div className={`${s.color} h-1.5 rounded-full transition-all`} style={{ width: `${(s.val/10)*100}%` }} />
                       </div>
                     </div>
                   ))}
                 </div>
                 
               </CardContent>
             ) : (
               <CardContent className="p-6 text-center text-text-muted text-xs font-medium">
                 Analysis will appear once content is generated.
               </CardContent>
             )}
          </Card>

          {/* Intelligent Suggestions */}
          <Card className="border-border bg-surface shadow-sm flex flex-col h-full max-h-[350px]">
             <div className="p-4 border-b border-border bg-surface-hover/30">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning" /> AI Suggestions
                </h3>
             </div>
             <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1">
               {isGenerated && activeContent.improvements && activeContent.improvements.length > 0 ? (
                 <div className="flex flex-col divide-y divide-border">
                   {activeContent.improvements.map((imp: any, idx: number) => (
                     <div key={idx} className="p-4 hover:bg-surface-hover/50 transition-colors">
                       <div className="flex items-center gap-2 mb-2">
                         <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${imp.severity === 'High' ? 'bg-danger/10 text-danger border-danger/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                           {imp.severity}
                         </span>
                         <span className="text-xs font-bold text-text-primary">{imp.improvement_type}</span>
                       </div>
                       <p className="text-xs text-text-secondary font-medium leading-relaxed mb-3">{imp.description}</p>
                       <Button 
                         onClick={() => handleApplyFix(idx)}
                         disabled={processingAction === `fix-${idx}`}
                         variant="outline" 
                         size="sm" 
                         className="w-full text-xs font-bold gap-1.5 h-7 bg-background"
                       >
                         <RefreshCw className={`w-3 h-3 ${processingAction === `fix-${idx}` ? 'animate-spin' : ''}`} /> 
                         {processingAction === `fix-${idx}` ? 'Applying...' : 'Apply Fix'}
                       </Button>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="p-6 text-center text-text-muted text-xs font-medium h-full flex items-center justify-center">
                   {isGenerated ? "No critical improvements found. Great job!" : "Suggestions will appear here."}
                 </div>
               )}
             </CardContent>
          </Card>

        </div>
      </div>

      {/* Multi-Platform Engine Row */}
      {isGenerated && (
        <div className="w-full">
          <PlatformEngine contentId={activeContent.id} />
        </div>
      )}

      {/* Publish Actions Footer */}
      {isGenerated && (
        <div className="sticky bottom-4 z-40 bg-surface/80 backdrop-blur-md border border-border rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2 px-2">
             <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
             <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Ready for Publishing</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <Button onClick={handleExport} variant="outline" size="sm" className="gap-2 font-bold text-text-secondary hover:text-text-primary bg-background">
               <Download className="w-4 h-4" /> Export
             </Button>
             
             <Button 
               variant="outline" 
               size="sm" 
               onClick={handleGenerateAll}
               disabled={generatingAll}
               className="gap-2 font-bold text-primary border-primary/20 bg-primary/5 hover:bg-primary/10"
             >
               {generatingAll ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
               Generate All Variants
             </Button>

             <div className="w-px h-6 bg-border mx-2"></div>

             <Button 
               onClick={handleApprove}
               size="sm" 
               className="gap-2 font-bold bg-background text-text-primary hover:bg-surface border border-border"
             >
               <Check className="w-4 h-4" /> Approve Draft
             </Button>

             <Button 
               onClick={handlePublishNow}
               size="sm" 
               className="gap-2 font-bold shadow-lg shadow-primary/20"
             >
               <Send className="w-4 h-4" /> Send to Publishing Queue
             </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContentGenerator;

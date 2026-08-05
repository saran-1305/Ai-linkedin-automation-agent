import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Briefcase, Target, Mic, Settings, Smartphone, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { businessApi } from '../../services/api/businessApi';
import MagicUploadAssistant from '../../components/business/MagicUploadAssistant';
import SmartMergeReview from '../../components/business/SmartMergeReview';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showMagicUpload, setShowMagicUpload] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const form = useForm({
    defaultValues: {
      company_name: '',
      industry: '',
      description: '',
      website: '',
      marketing_goals: '',
      primary_audience: '',
      pain_points: '',
      brand_voice: 'Professional and authoritative',
      competitors: '',
      ai_mode: 'autonomous'
    }
  });

  const { register, handleSubmit, watch, setValue, getValues } = form;
  const ai_mode = watch('ai_mode');
  const company_name = watch('company_name');
  const industry = watch('industry');
  const description = watch('description');

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const onSubmit = async (data: any) => {
    if (step < 5) {
      handleNext();
      return;
    }

    setLoading(true);
    try {
      await businessApi.createProfile({
        company_name: data.company_name,
        industry: data.industry,
        description: data.description,
        website: data.website,
        marketing_goals: data.marketing_goals.split(',').map((s: string) => s.trim()),
        primary_audience: data.primary_audience,
        pain_points: data.pain_points.split(',').map((s: string) => s.trim()),
        brand_voice: data.brand_voice,
        competitors: data.competitors.split(',').map((s: string) => s.trim())
      });

      localStorage.setItem('ai_operating_mode', data.ai_mode);
      navigate('/dashboard');
    } catch (e) {
      console.error('Failed to create profile', e);
      alert('Failed to save business profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractionComplete = (data: any) => {
    setExtractedData(data);
  };

  const finishMerge = () => {
    setExtractedData(null);
    setShowMagicUpload(false);
  };

  if (extractedData) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <SmartMergeReview extractedData={extractedData} form={form} onComplete={finishMerge} />
      </div>
    );
  }

  if (showMagicUpload) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center flex-col">
        <MagicUploadAssistant onExtractionComplete={handleExtractionComplete} />
        <button onClick={() => setShowMagicUpload(false)} className="mt-6 text-slate-400 hover:text-white transition">Cancel</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans selection:bg-indigo-500/30">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Sidebar Steps */}
        <div className="w-full md:w-1/3 bg-slate-800/50 p-8 border-r border-slate-800 flex flex-col">
          <div className="mb-8">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI Growth OS</h1>
            <p className="text-sm text-slate-400 mt-1">Hire your AI Marketing Team</p>
          </div>
          
          <div className="space-y-6 flex-1">
            {[
              { num: 1, title: 'Operating Mode', icon: Settings },
              { num: 2, title: 'Business Basics', icon: Briefcase },
              { num: 3, title: 'Goals & Audience', icon: Target },
              { num: 4, title: 'Brand Identity', icon: Mic },
              { num: 5, title: 'Finish Setup', icon: Smartphone }
            ].map((s) => (
              <div key={s.num} className={`flex items-center gap-4 transition-all duration-300 ${step === s.num ? 'text-white' : step > s.num ? 'text-indigo-400' : 'text-slate-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === s.num ? 'border-indigo-500 bg-indigo-500/20' : 
                  step > s.num ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700'
                }`}>
                  {step > s.num ? <CheckCircle className="w-4 h-4 text-white" /> : <s.icon className="w-4 h-4" />}
                </div>
                <div className="font-medium">{s.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="w-full md:w-2/3 p-8 lg:p-12 flex flex-col relative">
          
          {step === 2 && (
            <button 
              onClick={() => setShowMagicUpload(true)}
              className="absolute top-8 right-8 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" /> Magic Extract
            </button>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
            
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-2xl font-bold mb-2">How should the AI operate?</h2>
                <p className="text-slate-400 mb-8">Choose the level of autonomy for your AI marketing team.</p>
                
                <div className="space-y-4">
                  <label className={`block p-6 rounded-xl border-2 cursor-pointer transition-all ${ai_mode === 'autonomous' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                    <div className="flex items-start gap-4">
                      <input type="radio" value="autonomous" {...register('ai_mode')} className="mt-1" />
                      <div>
                        <h3 className="font-bold text-lg text-white">Autonomous Mode (Recommended)</h3>
                        <p className="text-sm text-slate-400 mt-1">The AI will independently research, generate, schedule, and publish content based on your strategy. No manual approval needed.</p>
                      </div>
                    </div>
                  </label>

                  <label className={`block p-6 rounded-xl border-2 cursor-pointer transition-all ${ai_mode === 'approval' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                    <div className="flex items-start gap-4">
                      <input type="radio" value="approval" {...register('ai_mode')} className="mt-1" />
                      <div>
                        <h3 className="font-bold text-lg text-white">Approval Mode</h3>
                        <p className="text-sm text-slate-400 mt-1">The AI will generate content and place it in a queue. You must manually review and approve every post before it is scheduled.</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-2xl font-bold mb-2">Tell us about your business</h2>
                <p className="text-slate-400 mb-8 w-3/4">This gives the AI its foundational knowledge.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Company Name *</label>
                    <input type="text" {...register('company_name', { required: true })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Acme Corp" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Industry *</label>
                    <input type="text" {...register('industry', { required: true })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. B2B SaaS" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Website</label>
                    <input type="url" {...register('website')} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="https://acme.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">What does your business do? *</label>
                    <textarea {...register('description', { required: true })} rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none" placeholder="Describe your main products or services..."></textarea>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-2xl font-bold mb-2">Goals & Audience</h2>
                <p className="text-slate-400 mb-8">Who are we talking to and what do we want to achieve?</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Primary Target Audience</label>
                    <input type="text" {...register('primary_audience')} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Chief Marketing Officers" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Audience Pain Points (comma separated)</label>
                    <input type="text" {...register('pain_points')} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Low conversion rates, high churn" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Marketing Goals (comma separated)</label>
                    <textarea {...register('marketing_goals')} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none" placeholder="e.g. Generate 50 qualified leads per month, establish thought leadership"></textarea>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-2xl font-bold mb-2">Brand Identity</h2>
                <p className="text-slate-400 mb-8">How should the AI sound when writing for you?</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Brand Voice</label>
                    <select {...register('brand_voice')} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors">
                      <option value="Professional and authoritative">Professional and authoritative</option>
                      <option value="Casual and conversational">Casual and conversational</option>
                      <option value="Bold and provocative">Bold and provocative</option>
                      <option value="Educational and academic">Educational and academic</option>
                      <option value="Empathetic and inspiring">Empathetic and inspiring</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Main Competitors (comma separated)</label>
                    <textarea {...register('competitors')} rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none" placeholder="e.g. HubSpot, Salesforce, Marketo"></textarea>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center py-8">
                <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                  The AI has everything it needs. When you finish, the AI will immediately begin analyzing your business, researching competitors, and building your first strategy.
                </p>
                
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
                  <h3 className="font-medium text-white mb-2">Next Steps:</h3>
                  <ul className="text-sm text-slate-400 space-y-2">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> AI builds your Brand Memory</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> AI formulates a Weekly Plan</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Connect your LinkedIn account</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-auto pt-6 border-t border-slate-800">
              {step > 1 ? (
                <button type="button" onClick={handleBack} className="px-6 py-2.5 text-sm font-medium text-slate-300 hover:text-white flex items-center gap-2 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : <div></div>}
              
              {step < 5 ? (
                <button 
                  type="submit"
                  disabled={step === 2 && (!company_name || !industry || !description)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
                >
                  {loading ? 'Initializing AI Team...' : 'Launch AI Operating System'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '../../services/api/businessApi';

import { ProfileHero } from './components/ProfileHero';
import { SmartInsightCard } from './components/SmartInsightCard';
import { WorkspaceSections } from './components/WorkspaceSections';
import { RightSidebar } from './components/RightSidebar';
import { AIUnderstanding } from './components/AIUnderstanding';
import { StickyActionBar } from './components/StickyActionBar';
import { Button } from '../../components/ui/Button';
import { Sparkles } from 'lucide-react';
import MagicUploadAssistant from '../../components/business/MagicUploadAssistant';
import SmartMergeReview from '../../components/business/SmartMergeReview';

const businessProfileSchema = z.object({
  company_name: z.string().min(1, 'Company Name is required'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  industry: z.string().min(1, 'Industry is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().optional(),
  usp: z.string().optional(),
  primary_audience: z.string().min(1, 'Primary Audience is required').optional().or(z.literal('')),
  secondary_audience: z.string().optional(),
  pain_points: z.string().min(1, 'Pain points are required').optional().or(z.literal('')),
  brand_voice: z.string().min(1, 'Brand voice is required'),
  writing_style: z.string().optional(),
  marketing_goals: z.string().min(1, 'Marketing goals are required').optional().or(z.literal('')),
});

export type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;

const BusinessProfile: React.FC = () => {
  const queryClient = useQueryClient();
  const [profileId, setProfileId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showMagicUpload, setShowMagicUpload] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      company_name: '', website: '', industry: '', description: '', location: '', usp: '',
      primary_audience: '', secondary_audience: '', pain_points: '', brand_voice: '', writing_style: '', marketing_goals: ''
    }
  });

  const formData = watch();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['businessProfiles'],
    queryFn: businessApi.getAllProfiles
  });

  useEffect(() => {
    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      setProfileId(profile.id);
      setIsEditing(false);
      reset({
        company_name: profile.company_name || '',
        website: profile.website || '',
        industry: profile.industry || '',
        description: profile.description || '',
        location: profile.location || '',
        usp: profile.usp || '',
        primary_audience: profile.primary_audience || '',
        secondary_audience: profile.secondary_audience || '',
        pain_points: (profile.pain_points || []).join('\n') || '',
        brand_voice: profile.brand_voice || '',
        writing_style: profile.writing_style || '',
        marketing_goals: (profile.marketing_goals || []).join('\n') || '',
      });
    } else if (profiles && profiles.length === 0) {
      setIsEditing(true);
    }
  }, [profiles, reset]);

  const mutation = useMutation({
    mutationFn: (data: BusinessProfileFormData) => {
      const payload = {
        ...data,
        pain_points: data.pain_points ? data.pain_points.split('\n').filter(Boolean) : [],
        marketing_goals: data.marketing_goals ? data.marketing_goals.split('\n').filter(Boolean) : [],
      };
      
      if (profileId) {
        return businessApi.updateProfile(profileId, payload);
      }
      return businessApi.createProfile(payload);
    },
    onSuccess: (data) => {
      setProfileId(data.id);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['businessProfiles'] });
      reset(formData);
    }
  });

  const onSubmit = (data: BusinessProfileFormData) => {
    mutation.mutate(data);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      reset({
        company_name: profile.company_name || '',
        website: profile.website || '',
        industry: profile.industry || '',
        description: profile.description || '',
        location: profile.location || '',
        usp: profile.usp || '',
        primary_audience: profile.primary_audience || '',
        secondary_audience: profile.secondary_audience || '',
        pain_points: (profile.pain_points || []).join('\n') || '',
        brand_voice: profile.brand_voice || '',
        writing_style: profile.writing_style || '',
        marketing_goals: (profile.marketing_goals || []).join('\n') || '',
      });
    } else {
      reset();
    }
  };

  const isIdentityComplete = !!(formData.company_name && formData.industry && formData.description);
  const isAudienceComplete = !!(formData.primary_audience && formData.pain_points);
  const isBrandComplete = !!formData.brand_voice;
  const isGoalsComplete = !!(formData.marketing_goals);
  
  const completedCount = [isIdentityComplete, isAudienceComplete, isBrandComplete, isGoalsComplete].filter(Boolean).length;
  const completionPercentage = Math.round((completedCount / 4) * 100);

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted">Loading workspace...</div>;
  }

  return (
    <div className="space-y-6 animate-in pb-24 max-w-7xl mx-auto">
      
      {/* 12 Columns - Hero Section */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <ProfileHero 
            companyName={formData.company_name} 
            completionPercentage={completionPercentage} 
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
          />
        </div>
      </div>

      {/* 12 Columns - Smart Insight & Progress */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <SmartInsightCard completionPercentage={completionPercentage} />
        </div>
      </div>

      {showMagicUpload && !extractedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-3xl relative">
            <button onClick={() => setShowMagicUpload(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
              X
            </button>
            <MagicUploadAssistant onExtractionComplete={setExtractedData} />
          </div>
        </div>
      )}

      {extractedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-4xl relative">
            <SmartMergeReview 
              extractedData={extractedData} 
              form={{ getValues: watch, setValue, formState: { dirtyFields: {} } } as any} 
              onComplete={() => {
                setExtractedData(null);
                setShowMagicUpload(false);
                setIsEditing(true); // they just merged new data, so we should go into edit mode to let them review and save
              }} 
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Main Workspace (8) + Sidebar (4) */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 lg:col-span-8">
            {!isEditing && (
              <div className="flex justify-end mb-4 gap-3">
                <Button onClick={() => setShowMagicUpload(true)} variant="primary" className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 border-0">
                  <Sparkles className="w-4 h-4" /> Magic Extract
                </Button>
                <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2 bg-surface">
                  Edit Profile
                </Button>
              </div>
            )}
            <WorkspaceSections register={register} errors={errors} data={formData} isEditing={isEditing} />
          </div>
          
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-20">
              <RightSidebar data={formData} />
            </div>
          </div>
        </div>
      </form>

      {/* 12 Columns - AI Understanding Preview */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <AIUnderstanding data={formData} />
        </div>
      </div>

      {isEditing && (
        <StickyActionBar 
          isDirty={isDirty || isEditing} 
          isSaving={mutation.isPending} 
          onCancel={handleCancel} 
          onSave={handleSubmit(onSubmit)} 
        />
      )}
    </div>
  );
};

export default BusinessProfile;

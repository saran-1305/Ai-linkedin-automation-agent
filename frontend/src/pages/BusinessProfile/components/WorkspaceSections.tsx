import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { ChevronDown, ChevronUp, CheckCircle2, CircleDashed } from 'lucide-react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { BusinessProfileFormData } from '../index';

interface SectionProps {
  title: string;
  isComplete: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<SectionProps> = ({ title, isComplete, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="mb-4 overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-hover transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <CircleDashed className="w-5 h-5 text-text-muted" />
          )}
          <h3 className="font-semibold text-text-primary text-base">{title}</h3>
        </div>
        <div className="text-text-muted">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>
      
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-4 border-t border-border bg-surface/30 space-y-4">
          {children}
        </div>
      </div>
    </Card>
  );
};

interface WorkspaceSectionsProps {
  register: UseFormRegister<BusinessProfileFormData>;
  errors: FieldErrors<BusinessProfileFormData>;
  data: Partial<BusinessProfileFormData>;
  isEditing: boolean;
}

export const WorkspaceSections: React.FC<WorkspaceSectionsProps> = ({ register, errors, data, isEditing }) => {
  
  const isIdentityComplete = !!(data.company_name && data.industry && data.description);
  const isAudienceComplete = !!(data.primary_audience && data.pain_points);
  const isBrandComplete = !!data.brand_voice;
  const isGoalsComplete = !!(data.marketing_goals);

  return (
    <div className="space-y-2">
      
      <CollapsibleSection title="Business Identity" isComplete={isIdentityComplete} defaultOpen={!isIdentityComplete || isEditing}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input disabled={!isEditing} label="Company Name *" placeholder="Acme Corp" {...register('company_name')} error={errors.company_name?.message} />
          <Input disabled={!isEditing} label="Industry *" placeholder="B2B SaaS" {...register('industry')} error={errors.industry?.message} />
          <Input disabled={!isEditing} label="Website" placeholder="https://acme.com" {...register('website')} error={errors.website?.message} />
          <Input disabled={!isEditing} label="Location" placeholder="San Francisco, CA" {...register('location')} error={errors.location?.message} />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Business Description *</label>
          <textarea 
            disabled={!isEditing}
            className={`flex w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary min-h-[100px] disabled:opacity-50 disabled:cursor-not-allowed ${errors.description ? 'border-danger focus:ring-danger' : 'border-border'}`}
            placeholder="What does your business do? What problem do you solve?"
            {...register('description')}
          />
          {errors.description && <p className="mt-1 text-sm text-danger">{errors.description.message}</p>}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Unique Selling Proposition (USP)</label>
          <textarea 
            disabled={!isEditing}
            className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary min-h-[60px] disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Why should customers choose you over competitors?"
            {...register('usp')}
          />
        </div>
      </CollapsibleSection>

      <div id="target-audience">
        <CollapsibleSection title="Target Audience" isComplete={isAudienceComplete} defaultOpen={(isIdentityComplete && !isAudienceComplete) || isEditing}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input disabled={!isEditing} label="Primary Audience *" placeholder="e.g. CTOs, Marketing Managers" {...register('primary_audience')} error={errors.primary_audience?.message} />
            <Input disabled={!isEditing} label="Secondary Audience" placeholder="e.g. Indie Hackers" {...register('secondary_audience')} error={errors.secondary_audience?.message} />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Customer Pain Points *</label>
            <textarea 
              disabled={!isEditing}
              className={`flex w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed ${errors.pain_points ? 'border-danger focus:ring-danger' : 'border-border'}`}
              placeholder="What are the biggest challenges your audience faces?"
              {...register('pain_points')}
            />
            {errors.pain_points && <p className="mt-1 text-sm text-danger">{errors.pain_points.message}</p>}
          </div>
        </CollapsibleSection>
      </div>

      <CollapsibleSection title="Brand Voice" isComplete={isBrandComplete} defaultOpen={(isAudienceComplete && !isBrandComplete) || isEditing}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input disabled={!isEditing} label="Brand Voice *" placeholder="e.g. Professional, Witty, Authoritative" {...register('brand_voice')} error={errors.brand_voice?.message} />
          <Input disabled={!isEditing} label="Writing Style" placeholder="e.g. Concise, Academic, Story-driven" {...register('writing_style')} error={errors.writing_style?.message} />
        </div>
      </CollapsibleSection>

      <div id="business-goals">
        <CollapsibleSection title="Business Goals" isComplete={isGoalsComplete} defaultOpen={(isBrandComplete && !isGoalsComplete) || isEditing}>
          <div className="mt-2">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Marketing Goals *</label>
            <textarea 
              disabled={!isEditing}
              className={`flex w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed ${errors.marketing_goals ? 'border-danger focus:ring-danger' : 'border-border'}`}
              placeholder="What do you want to achieve with your content? (e.g. Lead generation, brand awareness)"
              {...register('marketing_goals')}
            />
            {errors.marketing_goals && <p className="mt-1 text-sm text-danger">{errors.marketing_goals.message}</p>}
          </div>
        </CollapsibleSection>
      </div>

    </div>
  );
};

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Fingerprint } from 'lucide-react';

interface BrandIdentityProps {
  profile: any;
}

export const BrandIdentity: React.FC<BrandIdentityProps> = ({ profile }) => {
  if (!profile) return null;

  return (
    <Card className="border-border bg-surface h-full">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-primary" /> Brand Identity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Core Mission</h4>
          <p className="text-sm text-text-primary leading-relaxed">{profile.core_mission || 'Not defined'}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Brand Vision</h4>
            <p className="text-sm text-text-secondary leading-relaxed">{profile.brand_vision || 'Not defined'}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Value Proposition</h4>
            <p className="text-sm text-text-secondary leading-relaxed">{profile.value_proposition || 'Not defined'}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Primary Industry</h4>
            <div className="text-sm font-medium text-text-primary">{profile.primary_industry || 'N/A'}</div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Brand Positioning</h4>
            <div className="text-sm font-medium text-text-primary">{profile.brand_positioning || 'N/A'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

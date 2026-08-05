import React from 'react';
import { Button } from '../../../components/ui/Button';

interface StickyActionBarProps {
  isDirty: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({ isDirty, isSaving, onCancel, onSave }) => {
  if (!isDirty) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-surface border-t border-border p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-50 animate-in slide-in-from-bottom-full duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-sm font-medium text-text-primary hidden sm:block">
          You have unsaved changes.
        </div>
        <div className="flex gap-3 w-full sm:w-auto justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

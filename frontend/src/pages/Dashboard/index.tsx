import React from 'react';
import { HeroSection } from './components/HeroSection';
import { QuickActions } from './components/QuickActions';
import { TodaysFocus } from './components/TodaysFocus';
import { AIRecommendations } from './components/AIRecommendations';
import { AIPipeline } from './components/AIPipeline';
import { WorkspaceInsights } from './components/WorkspaceInsights';
import { AICommandCenter } from './components/AICommandCenter';
import { AISystemHealth } from './components/AISystemHealth';
import { PerformanceSummary } from './components/PerformanceSummary';
import { RecentActivityTimeline } from './components/RecentActivityTimeline';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-in pb-12 max-w-7xl mx-auto">
      
      {/* 12 Columns - Hero Section */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <HeroSection />
        </div>
      </div>

      {/* 12 Columns - Quick Actions */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <QuickActions />
        </div>
      </div>

      {/* 7 / 5 Columns - Today's Focus & Recommendations */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <TodaysFocus />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <AIRecommendations />
        </div>
      </div>

      {/* 12 Columns - AI Pipeline */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <AIPipeline />
        </div>
      </div>

      {/* 6 / 6 Columns - Workspace Insights & AI Command Center */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6">
          <WorkspaceInsights />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <AICommandCenter />
        </div>
      </div>

      {/* 4 / 4 / 4 Columns - System Health, Performance, Activity */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <AISystemHealth />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <PerformanceSummary />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <RecentActivityTimeline />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;

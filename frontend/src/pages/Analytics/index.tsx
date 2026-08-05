import React, { useState, useEffect } from 'react';
import { analyticsDashboardApi, type DashboardSummary } from '../../services/api/analyticsDashboardApi';
import KPICards from './components/widgets/KPICards';
import PerformanceChart from './components/widgets/PerformanceChart';
import TopPostsTable from './components/widgets/TopPostsTable';
import PlatformComparison from './components/widgets/PlatformComparison';
import ActivityTimeline from './components/widgets/ActivityTimeline';
import { Download, RefreshCw, Calendar, LineChart } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const summary = await analyticsDashboardApi.getSummary();
      setData(summary);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Setup auto-refresh every 60 seconds
    const interval = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance' },
    { id: 'posts', label: 'Top Posts' },
    { id: 'platforms', label: 'Platforms' },
  ];

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-text-muted animate-pulse">Loading Analytics Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in pb-24 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5 w-64 h-64 -mt-10 -mr-10 pointer-events-none">
           <LineChart className="w-full h-full text-primary" />
        </div>
        <div className="z-10">
          <h2 className="text-3xl font-bold text-text-primary flex items-center gap-3">
             Analytics Engine
          </h2>
          <p className="text-text-secondary mt-1 font-medium">Enterprise performance metrics and publishing intelligence.</p>
        </div>
        
        <div className="z-10 flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-background border border-border rounded-lg p-1 shadow-inner">
            <button className="px-3 py-1.5 text-xs font-bold rounded-md bg-surface text-text-primary shadow-sm">30 Days</button>
            <button className="px-3 py-1.5 text-xs font-bold rounded-md text-text-muted hover:text-text-primary transition-colors">90 Days</button>
            <button className="px-3 py-1.5 text-xs font-bold rounded-md text-text-muted hover:text-text-primary transition-colors">
              <Calendar className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <Button 
            variant="outline"
            onClick={() => fetchData(true)} 
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-text-primary text-background shadow-sm'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-text-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Content */}
      {data && (
        <div className="space-y-8">
          {/* Always show KPIs if in Overview */}
          {(activeTab === 'overview' || activeTab === 'performance') && (
            <KPICards metrics={data.overview} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {(activeTab === 'overview' || activeTab === 'performance') && (
                <PerformanceChart trends={data.trends} />
              )}
              
              {(activeTab === 'overview' || activeTab === 'posts') && (
                <TopPostsTable posts={data.top_posts} />
              )}
            </div>
            
            <div className="lg:col-span-4 space-y-8">
              {(activeTab === 'overview' || activeTab === 'platforms') && (
                <PlatformComparison platforms={data.platform_performance} />
              )}
              
              {(activeTab === 'overview' || activeTab === 'performance') && (
                <ActivityTimeline activities={data.recent_activity} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;

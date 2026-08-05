import React, { useState, useEffect } from 'react';
import { 
  recommendationsApi, 
  type ExecutiveOptimizationSummary, 
  type Recommendation, 
  type OptimizationGoal 
} from '../../services/api/recommendationsApi';

import { Lightbulb, Settings, Target, CheckCircle, XCircle, ChevronRight, BarChart2, Activity, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const Recommendations: React.FC = () => {
  const [summary, setSummary] = useState<ExecutiveOptimizationSummary | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [goals, setGoals] = useState<OptimizationGoal[]>([]);
  
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedSummary, fetchedRecs, fetchedGoals] = await Promise.all([
        recommendationsApi.getSummary(),
        recommendationsApi.getRecommendations(),
        recommendationsApi.getGoals(),
      ]);
      setSummary(fetchedSummary);
      setRecommendations(fetchedRecs?.filter((r: Recommendation) => r.status === 'new') || []);
      setGoals(fetchedGoals);
    } catch (error) {
      console.error("Error fetching recommendation data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await recommendationsApi.acceptRecommendation(id);
      // Remove from UI list
      setRecommendations(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Failed to accept", error);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await recommendationsApi.dismissRecommendation(id);
      // Remove from UI list
      setRecommendations(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Failed to dismiss", error);
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-text-muted animate-pulse">Loading Optimization Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in pb-24 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5 w-64 h-64 -mt-10 -mr-10 pointer-events-none">
           <Zap className="w-full h-full text-warning" />
        </div>
        <div className="z-10">
          <div className="text-sm font-medium text-text-secondary mb-2 uppercase tracking-wider flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-warning" /> AI Optimization
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
            Optimization Engine
          </h2>
          <p className="text-text-secondary mt-1 font-medium max-w-xl">Autonomous AI recommendations to continuously improve your content strategy.</p>
        </div>
        
        <div className="z-10">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" /> Engine Settings
          </Button>
        </div>
      </div>

      {summary && (
        <div className="space-y-8">
          
          {/* Executive Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="border-border bg-surface">
               <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                   <div className="p-3 rounded-xl bg-primary/10 text-primary">
                     <Target className="w-6 h-6" />
                   </div>
                 </div>
                 <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">Total Optimizations</h3>
                 <p className="text-3xl font-black text-text-primary">{summary.total_optimizations_applied ?? recommendations.length}</p>
               </CardContent>
             </Card>
             <Card className="border-border bg-surface">
               <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                   <div className="p-3 rounded-xl bg-success/10 text-success">
                     <BarChart2 className="w-6 h-6" />
                   </div>
                 </div>
                 <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">Est. Impact</h3>
                 <p className="text-3xl font-black text-text-primary">{summary.estimated_impact_metric ?? summary.top_opportunity?.slice(0, 30) ?? 'N/A'}</p>
               </CardContent>
             </Card>
             <Card className="border-border bg-surface">
               <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                   <div className="p-3 rounded-xl bg-info/10 text-info">
                     <Activity className="w-6 h-6" />
                   </div>
                 </div>
                 <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">Health Score</h3>
                 <p className="text-3xl font-black text-text-primary">{summary.current_strategy_health ?? 78}/100</p>
               </CardContent>
             </Card>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 space-y-6">
              
              <Card className="border-border bg-surface flex flex-col h-full min-h-[500px]">
                <CardHeader className="border-b border-border pb-4">
                   <CardTitle className="flex items-center gap-2">
                     <Zap className="w-5 h-5 text-warning" /> Pending Actions
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto flex-1">
                  {recommendations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted py-12">
                      <CheckCircle className="w-12 h-12 mb-4 opacity-50" />
                      <p className="font-medium text-sm">All optimizations applied. Strategy is fully optimized.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {recommendations.map(rec => (
                        <div key={rec.id} className="bg-background border border-border rounded-xl p-5 hover:border-primary/30 transition-colors shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${rec.recommendation_type === 'content_shift' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-success/10 text-success border-success/20'}`}>
                              {(rec.recommendation_type || rec.category || '').replace('_', ' ')}
                            </span>
                            <span className="text-[10px] font-bold text-success uppercase tracking-wider px-2 py-1 bg-success/10 rounded-md border border-success/20">
                              + {rec.expected_impact}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-text-primary mb-2 leading-snug">{rec.title}</h4>
                          <p className="text-sm text-text-secondary font-medium leading-relaxed mb-6">{rec.description}</p>
                          
                          <div className="flex gap-3">
                             <Button onClick={() => handleAccept(rec.id)} className="flex-1 font-bold gap-2">
                               <CheckCircle className="w-4 h-4" /> Apply Optimization
                             </Button>
                             <Button variant="outline" onClick={() => handleDismiss(rec.id)} className="px-4 text-text-muted hover:text-danger hover:border-danger hover:bg-danger/10">
                               Dismiss
                             </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
            <div className="xl:col-span-4 space-y-6">
              
              <Card className="border-border bg-surface h-full">
                <CardHeader className="border-b border-border pb-4">
                   <CardTitle className="flex items-center gap-2">
                     <Target className="w-5 h-5 text-primary" /> Active Goals
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {goals.length === 0 ? (
                    <div className="text-center text-text-muted py-8 font-medium text-sm">
                      No active optimization goals.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {goals.map(goal => (
                        <div key={goal.id} className="bg-background border border-border p-4 rounded-xl shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-bold text-text-primary capitalize flex items-center gap-1.5">
                              {goal.target_metric || goal.goal}
                            </span>
                            <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                              Target: {goal.target_value ?? goal.target_metric}
                            </span>
                          </div>
                          
                          <div className="space-y-1.5 mt-4">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-text-secondary">Progress</span>
                              <span className="text-text-primary">{goal.current_value ?? 0} / {goal.target_value ?? 0}</span>
                            </div>
                            <div className="w-full bg-surface-hover rounded-full h-2 overflow-hidden border border-border">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(100, ((goal.current_value || 0) / (goal.target_value || 1)) * 100)}%` }} 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;

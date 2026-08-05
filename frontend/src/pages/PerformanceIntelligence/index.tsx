import React, { useState, useEffect } from 'react';
import { 
  performanceIntelligenceApi, 
  type ExecutiveSummary, 
  type PerformanceInsight, 
  type PerformanceRecommendation, 
  type PerformanceMemory 
} from '../../services/api/performanceIntelligenceApi';

import { BrainCircuit, RefreshCw, Zap, TrendingUp, AlertTriangle, Lightbulb, Target, BookOpen, Activity, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const PerformanceIntelligence: React.FC = () => {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [recommendations, setRecommendations] = useState<PerformanceRecommendation[]>([]);
  const [memory, setMemory] = useState<PerformanceMemory | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedSummary, fetchedInsights, fetchedRecs, fetchedMemory] = await Promise.all([
        performanceIntelligenceApi.getSummary(),
        performanceIntelligenceApi.getInsights(),
        performanceIntelligenceApi.getRecommendations(),
        performanceIntelligenceApi.getMemory(),
      ]);
      setSummary(fetchedSummary);
      setInsights(fetchedInsights);
      setRecommendations(fetchedRecs);
      setMemory(fetchedMemory);
    } catch (error) {
      console.error("Error fetching intelligence data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerAnalysis = async () => {
    try {
      setAnalyzing(true);
      await performanceIntelligenceApi.triggerAnalysis();
      await fetchData(); // Refresh data
    } catch (error) {
      console.error("Error triggering analysis", error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-text-muted animate-pulse">Running AI Analysis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in pb-24 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5 w-64 h-64 -mt-10 -mr-10 pointer-events-none">
           <BrainCircuit className="w-full h-full text-primary" />
        </div>
        <div className="z-10">
          <div className="text-sm font-medium text-text-secondary mb-2 uppercase tracking-wider flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-primary" /> AI Intelligence
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
            Performance Engine
          </h2>
          <p className="text-text-secondary mt-1 font-medium max-w-xl">Actionable business intelligence generated continuously from your content analytics.</p>
        </div>
        
        <div className="z-10 flex gap-4 items-center">
          <Button 
            size="lg"
            onClick={handleTriggerAnalysis} 
            disabled={analyzing}
            className="gap-2 shadow-lg shadow-primary/20"
          >
            {analyzing ? (
              <><RefreshCw className="w-5 h-5 animate-spin" /> Analyzing...</>
            ) : (
              <><Zap className="w-5 h-5" /> Trigger AI Analysis</>
            )}
          </Button>
        </div>
      </div>

      {summary && memory && (
        <div className="space-y-8">
          
          {/* Executive Summary */}
          <Card className="border-border bg-surface">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="flex items-center gap-2">
                 <Target className="w-5 h-5 text-primary" /> Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Overall Performance</h4>
                  <p className="text-text-primary font-medium leading-relaxed bg-background p-4 rounded-xl border border-border">{summary.overall_performance}</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Strategic Shift</h4>
                  <p className="text-text-secondary leading-relaxed bg-background p-4 rounded-xl border border-border">{summary.audience_behavior || 'No specific audience shifts detected at this time.'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* AI Insights List */}
            <div className="space-y-4">
               <h3 className="text-xl font-bold text-text-primary flex items-center gap-2 mb-2">
                 <Lightbulb className="w-5 h-5 text-warning" /> Discovered Insights
               </h3>
               {insights.map((insight) => (
                 <Card key={insight.id || Math.random().toString()} className="border-border bg-surface hover:border-warning/30 transition-colors">
                   <CardContent className="p-5">
                     <div className="flex justify-between items-start mb-3">
                       <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${insight.insight_type === 'Audience' ? 'bg-primary/10 text-primary border-primary/20' : insight.insight_type === 'Content' ? 'bg-success/10 text-success border-success/20' : 'bg-info/10 text-info border-info/20'}`}>
                         {insight.insight_type || 'Insight'}
                       </span>
                       <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${insight.confidence > 0.8 ? 'bg-warning/10 text-warning border-warning/20' : 'bg-background text-text-secondary border-border'}`}>
                         {Math.round((insight.confidence || 0.8) * 100)}% Confidence
                       </span>
                     </div>
                     <h4 className="text-sm font-bold text-text-primary mb-2 leading-snug">{insight.title || insight.description}</h4>
                     <p className="text-xs text-text-secondary font-medium flex items-start gap-1.5 bg-background p-3 rounded-lg border border-border mt-3">
                        <Zap className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" /> {insight.suggested_action || insight.description}
                     </p>
                   </CardContent>
                 </Card>
               ))}
            </div>

            {/* Recommendations Panel */}
            <div className="space-y-4">
               <h3 className="text-xl font-bold text-text-primary flex items-center gap-2 mb-2">
                 <Activity className="w-5 h-5 text-success" /> Recommended Actions
               </h3>
               {recommendations.map((rec, idx) => (
                 <Card key={idx} className="border-border bg-surface hover:border-success/30 transition-colors">
                   <CardContent className="p-5">
                     <div className="flex justify-between items-start mb-3">
                       <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${rec.priority === 'High' ? 'bg-danger/10 text-danger border-danger/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                         {rec.priority} Priority
                       </span>
                     </div>
                     <h4 className="text-sm font-bold text-text-primary mb-2 leading-snug">{rec.recommendation}</h4>
                     <p className="text-xs text-text-secondary mb-4">{rec.reason}</p>
                     
                     <div className="grid grid-cols-2 gap-3 mt-4">
                       <div className="bg-background p-3 rounded-lg border border-border">
                         <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Expected Impact</span>
                         <span className="text-xs font-semibold text-success">{rec.expected_impact}</span>
                       </div>
                       <div className="bg-background p-3 rounded-lg border border-border">
                         <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Confidence</span>
                         <span className="text-xs font-medium text-text-secondary">{Math.round((rec.confidence || 0.8) * 100)}%</span>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               ))}
            </div>
          </div>
          
          {/* Performance Memory View */}
          <Card className="border-border bg-surface">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="flex items-center gap-2">
                 <BookOpen className="w-5 h-5 text-primary" /> AI Long-Term Memory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-success" /> Proven Strategies
                  </h4>
                  <ul className="space-y-3">
                    {[
                      ...(memory?.winning_topics || []).map(t => `Topic: ${t.topic} (score ${t.score})`),
                      ...(memory?.winning_hooks || []).map(h => `Hook: ${h.hook} (score ${h.score})`),
                      ...(memory?.winning_ctas || []).map(c => `CTA: ${c.cta} (score ${c.score})`),
                      ...(memory?.winning_timing || []).map(t => `Best time: ${t.time} (score ${t.score})`),
                    ].map((strategy, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-text-secondary bg-background p-3 rounded-lg border border-border items-start">
                        <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" /> {strategy}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-danger" /> Failed Experiments
                  </h4>
                  <ul className="space-y-3">
                    {(memory?.common_failures || []).map((exp, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-text-secondary bg-background p-3 rounded-lg border border-border items-start">
                        <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" /> {exp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="text-sm font-bold text-text-primary mb-3">Audience Mental Model (Evolving)</h4>
                <div className="bg-background p-5 rounded-xl border border-border font-medium text-sm text-text-secondary leading-relaxed">
                  {(memory?.audience_preferences || []).join(', ') || 'No audience model data available yet.'}
                </div>
              </div>
            </CardContent>
          </Card>
          
        </div>
      )}
    </div>
  );
};

export default PerformanceIntelligence;

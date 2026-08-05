import React, { useState, useEffect } from 'react';
import { httpClient as api } from '../../services/api/httpClient';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { 
  CalendarDays, Zap, RefreshCw, Target, Layout, Users, 
  BarChart3, HelpCircle, CheckCircle, Smartphone,
  AlertTriangle, Crosshair, ListTree, ArrowRight, Star
} from 'lucide-react';

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
            {confidence && (
              <span className={`text-xs font-bold ${confidence > 0.8 ? 'text-success' : 'text-warning'}`}>
                {Math.round(confidence * 100)}% Conf
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{reasoning}</p>
        </div>
      )}
    </div>
  );
};

export const WeeklyPlanner = () => {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/execution/current');
      
      if (!data) {
        setPlan(null);
        return;
      }

      // Fetch all granular endpoints
      const [
        objRes, themesRes, platformsRes, audiencesRes, kpisRes,
        dailyRes, slotsRes, campaignsRes, funnelsRes, ctaRes, prioritiesRes, conflictsRes,
        healthRes, optRes, suggRes, alertRes, trendRes
      ] = await Promise.all([
        api.get('/execution/objective'),
        api.get('/execution/themes'),
        api.get('/execution/platforms'),
        api.get('/execution/audiences'),
        api.get('/execution/kpis'),
        api.get('/execution/daily'),
        api.get('/execution/content-slots'),
        api.get('/execution/campaigns'),
        api.get('/execution/funnel'),
        api.get('/execution/cta'),
        api.get('/execution/priorities'),
        api.get('/execution/conflicts'),
        api.get('/execution/health'),
        api.get('/execution/optimizations'),
        api.get('/execution/suggestions'),
        api.get('/execution/alerts'),
        api.get('/execution/trend-injections')
      ]);

      setPlan({
        ...data,
        objective: objRes.data,
        themes: themesRes.data,
        platforms: platformsRes.data,
        audiences: audiencesRes.data,
        kpis: kpisRes.data,
        daily: dailyRes.data,
        slots: slotsRes.data,
        campaigns: campaignsRes.data,
        funnels: funnelsRes.data,
        ctas: ctaRes.data,
        priorities: prioritiesRes.data,
        conflicts: conflictsRes.data,
        health: healthRes.data,
        optimizations: optRes.data,
        suggestions: suggRes.data,
        alerts: alertRes.data,
        trends: trendRes.data
      });
    } catch (error) {
      console.error('Failed to fetch plan', error);
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/execution/generate');
      await fetchPlan();
    } catch (error) {
      console.error('Failed to generate plan', error);
      alert('Failed to generate execution plan. Please ensure you have a Strategy Plan first!');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-text-muted animate-pulse">Loading Weekly Plan...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-7xl mx-auto px-4">
        <Card className="w-full max-w-2xl border-dashed bg-transparent p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6 shadow-sm">
            <CalendarDays className="w-10 h-10 text-primary opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">Execution Planner Standby</h2>
          <p className="text-text-secondary mb-8 leading-relaxed max-w-lg">
            Generate an ultra-granular, day-by-day execution blueprint based on your Master Strategy.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="px-8 py-6 text-lg font-medium shadow-lg"
          >
            {generating ? (
              <><RefreshCw className="w-6 h-6 mr-3 animate-spin" /> Drafting Blueprint...</>
            ) : (
              <><Zap className="w-6 h-6 mr-3" /> Generate Execution Plan</>
            )}
          </Button>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', icon: Target, label: 'Master Objective' },
    { id: 'daily', icon: CalendarDays, label: 'Daily Execution' },
    { id: 'slots', icon: Layout, label: 'Content Slots (Blueprint)' },
    { id: 'engine', icon: Zap, label: 'Priority Engine' }
  ];

  return (
    <div className="space-y-8 animate-in pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 relative overflow-hidden bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div className="absolute right-0 top-0 opacity-5 w-64 h-64 -mt-10 -mr-10 pointer-events-none">
          <CalendarDays className="w-full h-full text-primary" />
        </div>
        <div className="z-10">
          <div className="text-sm font-medium text-text-secondary mb-2 uppercase tracking-wider flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" /> Weekly Planner
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
            Week {plan.week_number} Execution
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20 font-semibold tracking-wide">
              v{plan.version}
            </span>
          </h2>
          <p className="text-text-secondary text-sm font-medium">
            {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
          </p>
        </div>
        
        <div className="z-10 flex gap-6 items-center">
          {plan.confidence && (
            <div className="text-right pr-6 border-r border-border">
              <div className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">AI Confidence</div>
              <div className="text-2xl font-bold text-success">{Math.round(plan.confidence * 100)}%</div>
            </div>
          )}
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={generating}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Regenerating...' : 'Regenerate Plan'}
          </Button>
        </div>
      </div>

      {/* Modern Pill Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-text-primary text-background shadow-sm'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-text-muted'
            }`}
          >
            <tab.icon className="w-4 h-4" /> 
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card className="border-border bg-surface">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" /> Primary Weekly Goal
                  </h3>
                  <span className="text-xs font-semibold bg-primary/10 px-3 py-1.5 rounded-md text-primary border border-primary/20 uppercase tracking-wider">
                    {plan.objective?.priority} Priority
                  </span>
                </div>
                <p className="text-2xl font-medium text-text-primary italic mb-8 border-l-4 border-primary pl-5 py-1">
                  "{plan.objective?.primary_goal}"
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-background p-5 rounded-xl border border-border">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5">Campaign Focus</h4>
                    <p className="text-sm text-text-secondary leading-relaxed">{plan.objective?.campaign_focus}</p>
                  </div>
                  <div className="bg-background p-5 rounded-xl border border-border">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5">Expected Outcome</h4>
                    <p className="text-sm text-text-secondary leading-relaxed">{plan.objective?.expected_outcome}</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end pt-6 border-t border-border">
                  <ExplainabilityBadge reasoning={plan.objective?.reasoning} confidence={plan.objective?.confidence} />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plan.kpis && [
                { label: 'Expected Reach', value: plan.kpis.expected_reach, icon: Users },
                { label: 'Engagement', value: plan.kpis.expected_engagement, icon: CheckCircle },
                { label: 'Leads', value: plan.kpis.expected_leads, icon: Target },
                { label: 'Avg CTR', value: `${plan.kpis.expected_ctr}%`, icon: BarChart3 }
              ].map((kpi, i) => (
                <Card key={i} className="border-border bg-surface">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <kpi.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-xs font-bold text-text-muted uppercase tracking-wider">{kpi.label}</div>
                    </div>
                    <div className="text-3xl font-black text-text-primary">{kpi.value?.toLocaleString() || '0'}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: DAILY EXECUTION */}
        {activeTab === 'daily' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2 mb-6">
              <CalendarDays className="w-5 h-5 text-primary" /> Daily Tactical Map
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                const dayPlan = plan.daily?.find((d: any) => d.day_of_week === day);
                if (!dayPlan) return null;
                return (
                  <Card key={day} className="border-border bg-surface hover:border-primary/50 transition-colors group">
                    <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                      <div className="md:w-48 flex-shrink-0 flex flex-col justify-center">
                        <h4 className="text-2xl font-black text-text-primary mb-2">{day}</h4>
                        <span className="text-xs font-semibold bg-background text-text-secondary px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 w-fit border border-border">
                          <Crosshair className="w-3.5 h-3.5" /> {dayPlan.funnel_stage}
                        </span>
                      </div>
                      <div className="flex-grow space-y-4">
                        <div>
                          <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Objective</span>
                          <p className="text-sm font-medium text-text-primary">{dayPlan.daily_objective}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-medium">
                          <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20">{dayPlan.campaign}</span>
                          <span className="bg-info/10 text-info px-2.5 py-1 rounded-md border border-info/20">{dayPlan.primary_audience}</span>
                          <span className="bg-warning/10 text-warning px-2.5 py-1 rounded-md border border-warning/20">{dayPlan.content_type}</span>
                          <span className="bg-danger/10 text-danger px-2.5 py-1 rounded-md border border-danger/20">CTA: {dayPlan.cta}</span>
                        </div>
                      </div>
                      <div className="md:w-32 flex-shrink-0 flex justify-end items-start md:items-center">
                        <ExplainabilityBadge reasoning={dayPlan.reasoning} confidence={dayPlan.confidence} />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CONTENT SLOTS */}
        {activeTab === 'slots' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                 <Layout className="w-5 h-5 text-primary" /> Content Slots (Blueprint)
               </h3>
               <p className="text-sm font-medium text-text-secondary">These slots automatically feed into the Content Generator.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plan.slots?.map((slot: any, i: number) => (
                <Card key={i} className="border-border bg-surface relative overflow-hidden flex flex-col h-full group hover:shadow-md transition-all">
                  <div className={`absolute top-0 left-0 w-full h-1 ${slot.priority === 'High' ? 'bg-danger' : 'bg-border'}`} />
                  <CardContent className="p-6 flex flex-col h-full pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-xs font-bold text-primary tracking-wider uppercase">{slot.day_of_week} • {slot.platform}</div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${slot.priority === 'High' ? 'bg-danger/10 text-danger border-danger/20' : 'bg-background text-text-secondary border-border'}`}>
                        {slot.priority} Priority
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-bold text-text-primary mb-2 leading-tight">{slot.topic}</h4>
                    <p className="text-sm text-text-secondary mb-6 line-clamp-2">{slot.objective}</p>
                    
                    <div className="bg-background p-4 rounded-xl border border-border mt-auto space-y-3">
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 border-b border-border pb-2">AI Generator Instructions</div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-text-muted font-medium">Format:</span> 
                        <span className="text-text-primary font-semibold">{slot.content_type}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-text-muted font-medium">Theme:</span> 
                        <span className="text-text-primary font-semibold truncate max-w-[120px]">{slot.theme}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-text-muted font-medium">Tone:</span> 
                        <span className="text-primary font-bold">{slot.content_generator_input?.tone || 'Default'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: OPTIMIZATION ENGINE */}
        {activeTab === 'engine' && (
          <div className="space-y-6">
            {/* Health Scorecard */}
            {plan.health && (
              <Card className="border-border bg-surface overflow-hidden">
                <CardContent className="p-8 relative">
                  <div className="absolute right-0 top-0 p-8 opacity-[0.03] pointer-events-none">
                    <Star className="w-48 h-48" />
                  </div>
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                      <h3 className="text-xl font-bold text-text-primary flex items-center gap-2 mb-1">
                        <Star className="w-5 h-5 text-success" /> Execution Health
                      </h3>
                      <p className="text-sm text-text-secondary">Continuous analysis of your active execution blueprint.</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-success tracking-tight">{plan.health.overall_score}<span className="text-2xl text-success/50">/100</span></div>
                      <div className="text-xs font-bold uppercase tracking-wider text-text-muted mt-1">Overall Score</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
                    {[
                      { label: 'Campaign Health', val: plan.health.campaign_health },
                      { label: 'Audience Coverage', val: plan.health.audience_coverage },
                      { label: 'Content Diversity', val: plan.health.content_diversity },
                      { label: 'Trend Alignment', val: plan.health.trend_alignment }
                    ].map(h => (
                      <div key={h.label} className="bg-background p-5 rounded-xl border border-border">
                        <div className="text-2xl font-bold text-text-primary mb-1">{h.val}%</div>
                        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">{h.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-medium text-text-secondary leading-relaxed bg-background p-4 rounded-xl border border-border relative z-10">
                    <span className="font-bold text-text-primary mb-1 block">AI Analysis:</span>
                    {plan.health.reasoning}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Alerts & Suggestions */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" /> Actionable Intelligence
                </h3>
                
                {plan.alerts && plan.alerts.length > 0 && (
                  <div className="space-y-3">
                    {(plan?.alerts || []).map((a: any, i: number) => (
                      <div key={i} className={`p-4 rounded-xl border ${a.severity === 'High' ? 'bg-danger/5 border-danger/20' : 'bg-warning/5 border-warning/20'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className={`w-4 h-4 ${a.severity === 'High' ? 'text-danger' : 'text-warning'}`} />
                          <span className={`text-sm font-bold tracking-wide uppercase ${a.severity === 'High' ? 'text-danger' : 'text-warning'}`}>{a.alert_type}</span>
                        </div>
                        <p className="text-sm text-text-secondary font-medium leading-relaxed">{a.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {plan.suggestions && plan.suggestions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Strategic Suggestions</h4>
                    {(plan?.suggestions || []).map((s: any, i: number) => (
                      <Card key={i} className="border-border bg-surface hover:border-success/30 transition-colors">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-sm font-bold text-success flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> {s.priority} Priority</span>
                            <span className="text-[10px] font-bold bg-background px-2 py-1 rounded-md text-text-secondary uppercase border border-border">Impact: {s.business_impact}</span>
                          </div>
                          <p className="text-sm text-text-primary font-medium mb-4">{s.suggestion}</p>
                          <div className="flex justify-end pt-3 border-t border-border">
                            <ExplainabilityBadge reasoning={s.reasoning} confidence={s.confidence} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Optimizations History & Trends */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary" /> Optimization Engine
                </h3>
                
                {plan.optimizations && plan.optimizations.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Applied Optimizations</h4>
                    <div className="relative border-l-2 border-border ml-3 space-y-6">
                      {(plan?.optimizations || []).map((opt: any, i: number) => (
                        <div key={i} className="relative pl-6">
                          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface border-2 border-primary flex items-center justify-center shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          </div>
                          <Card className="border-border bg-background">
                            <CardContent className="p-4">
                              <div className="text-sm font-bold text-primary mb-1">{opt.optimization_type}</div>
                              <p className="text-sm text-text-secondary font-medium mb-3">{opt.description}</p>
                              <div className="text-xs font-medium text-text-muted bg-surface p-2.5 rounded-md border border-border inline-block">
                                Impact: <span className="text-text-primary">{opt.expected_impact}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="border-border bg-surface">
                    <CardContent className="p-6 text-center">
                      <p className="text-sm font-medium text-text-secondary">No auto-optimizations applied yet. Run the Optimizer to analyze execution gaps.</p>
                    </CardContent>
                  </Card>
                )}

                {/* Trend Injections */}
                {plan.trends && plan.trends.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-info" /> Injected Trends
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {(plan?.trends || []).map((t: any, i: number) => (
                        <div key={i} className="bg-info/10 border border-info/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                          <span className="text-info font-bold">#{t.trend_name}</span>
                          <span className="text-text-secondary font-medium text-xs">({t.injection_type})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="mt-12 flex justify-center pb-8 pt-8 border-t border-border">
              <Button 
                size="lg"
                onClick={async () => {
                  if (confirm("This will archive the current plan and generate a fully optimized version. Proceed?")) {
                    await api.post('/execution/optimize');
                    await fetchPlan();
                  }
                }}
                className="px-10 py-6 text-lg font-bold shadow-xl shadow-primary/20 gap-3"
              >
                <Zap className="w-6 h-6" /> Run Optimization Engine
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyPlanner;

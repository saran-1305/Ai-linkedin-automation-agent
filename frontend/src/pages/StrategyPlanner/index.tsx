import React, { useState, useEffect } from 'react';
import { httpClient as api } from '../../services/api/httpClient';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { 
  Target, Crosshair, Users, MessageSquare, Briefcase, TrendingUp,
  CheckCircle, Zap, HelpCircle, Activity, Lightbulb,
  RefreshCw, Map, ShieldAlert, BarChart3, Presentation, CalendarDays,
  ChevronRight
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const ExplainabilityBadge = ({ reasoning, confidence, trends, competitors }: any) => {
  const [show, setShow] = useState(false);
  
  if (!reasoning) return null;

  return (
    <div className="relative inline-block">
      <button 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 transition-colors font-medium"
      >
        <HelpCircle className="w-3.5 h-3.5" /> AI Reasoning
      </button>
      
      {show && (
        <div className="absolute z-50 bottom-full right-0 mb-2 w-80 bg-surface border border-border rounded-xl shadow-dropdown p-5 text-left pointer-events-none animate-in">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">AI Logic</span>
            {confidence && (
              <span className={`text-xs font-bold ${confidence > 0.8 ? 'text-success' : 'text-warning'}`}>
                {Math.round(confidence * 100)}% Confidence
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{reasoning}</p>
          
          {(trends?.length > 0 || competitors?.length > 0) && (
            <div className="space-y-3 mt-4 pt-4 border-t border-border">
              {trends?.length > 0 && (
                <div>
                  <span className="text-xs text-text-muted font-medium block mb-1.5">Influenced by Trends:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {trends.map((t: string, i: number) => (
                      <span key={i} className="text-[10px] font-medium bg-success/10 text-success px-2 py-0.5 rounded-md border border-success/20">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {competitors?.length > 0 && (
                <div>
                  <span className="text-xs text-text-muted font-medium block mb-1.5">Influenced by Competitors:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {competitors.map((c: string, i: number) => (
                      <span key={i} className="text-[10px] font-medium bg-danger/10 text-danger px-2 py-0.5 rounded-md border border-danger/20">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const StrategyPlanner = () => {
  const [strategy, setStrategy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('executive');

  const fetchStrategy = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/strategy/current');
      
      const [
        pillarsRes, audiencesRes, messagingRes, positioningRes,
        oppsRes, recsRes, campaignsRes, weeklyRes, monthlyRes,
        risksRes, metricsRes, confRes
      ] = await Promise.all([
        api.get('/strategy/pillars'),
        api.get('/strategy/audiences'),
        api.get('/strategy/messaging'),
        api.get('/strategy/positioning'),
        api.get('/strategy/opportunities'),
        api.get('/strategy/recommendations'),
        api.get('/strategy/campaigns'),
        api.get('/strategy/weekly'),
        api.get('/strategy/monthly'),
        api.get('/strategy/risks'),
        api.get('/strategy/metrics'),
        api.get('/strategy/confidence')
      ]);

      setStrategy({
        ...data,
        pillars: pillarsRes.data,
        audiences: audiencesRes.data,
        messaging: messagingRes.data,
        positioning: positioningRes.data,
        opportunities: oppsRes.data,
        recommendations: recsRes.data,
        campaigns: campaignsRes.data,
        weekly: weeklyRes.data,
        monthly: monthlyRes.data,
        risks: risksRes.data,
        metrics: metricsRes.data,
        confidenceBreakdown: confRes.data
      });
    } catch (error) {
      console.error('Failed to fetch strategy', error);
      setStrategy(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategy();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/strategy/generate');
      await fetchStrategy();
    } catch (error) {
      console.error('Failed to generate strategy', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-text-muted animate-pulse">Loading AI Strategy...</p>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-7xl mx-auto px-4">
        <Card className="w-full max-w-2xl border-dashed bg-transparent p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6 shadow-sm">
            <Target className="w-10 h-10 text-primary opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">AI CMO is Standing By</h2>
          <p className="text-text-secondary mb-8 leading-relaxed max-w-lg">
            The Strategy Planner synthesizes Business Profile, Brand Brain, Competitors, and Trend data into a unified master marketing plan.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="px-8 py-6 text-lg font-medium shadow-lg"
          >
            {generating ? (
              <><RefreshCw className="w-6 h-6 mr-3 animate-spin" /> Generating Master Strategy...</>
            ) : (
              <><Zap className="w-6 h-6 mr-3" /> Generate Master Strategy</>
            )}
          </Button>
        </Card>
      </div>
    );
  }

  const renderConfidenceRadar = () => {
    if (!strategy.confidenceBreakdown) return null;
    const data = [
      { subject: 'Business', A: Math.round(strategy.confidenceBreakdown.business_confidence * 100) },
      { subject: 'Brand', A: Math.round(strategy.confidenceBreakdown.brand_confidence * 100) },
      { subject: 'Competitor', A: Math.round(strategy.confidenceBreakdown.competitor_confidence * 100) },
      { subject: 'Trend', A: Math.round(strategy.confidenceBreakdown.trend_confidence * 100) },
      { subject: 'Recommendation', A: Math.round(strategy.confidenceBreakdown.recommendation_confidence * 100) },
      { subject: 'Campaign', A: Math.round(strategy.confidenceBreakdown.campaign_confidence * 100) }
    ];

    return (
      <div className="h-64 w-full -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="var(--color-border)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
            <Radar name="Confidence" dataKey="A" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.15} />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }} 
              itemStyle={{ color: 'var(--color-primary)' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const tabs = [
    { id: 'executive', icon: Briefcase, label: 'Executive Summary' },
    { id: 'positioning', icon: Target, label: 'Positioning & Messaging' },
    { id: 'opportunities', icon: Lightbulb, label: 'Opportunity Engine' },
    { id: 'campaigns', icon: Presentation, label: 'Campaign Hub' },
    { id: 'roadmap', icon: CalendarDays, label: 'Strategic Roadmap' },
    { id: 'risks', icon: ShieldAlert, label: 'Risks & Metrics' }
  ];

  return (
    <div className="space-y-8 animate-in pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div>
          <div className="text-sm font-medium text-text-secondary mb-2 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Strategy Planner
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
            Master Strategy
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20 font-semibold tracking-wide">
              v{strategy.version || '1.0'}
            </span>
          </h2>
          <p className="text-text-secondary">Synthesized by the AI CMO using continuous market intelligence.</p>
        </div>
        
        <div className="flex gap-6 items-center">
          {strategy.confidenceBreakdown && (
            <div className="text-right pr-6 border-r border-border">
              <div className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">Overall Confidence</div>
              <div className="text-2xl font-bold text-success">{Math.round(strategy.confidenceBreakdown.overall_confidence * 100)}%</div>
            </div>
          )}
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={generating}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Regenerating...' : 'Regenerate Strategy'}
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

      {/* Content Area - Uses 12 column grid system internally for layouts */}
      <div className="mt-6">
        {/* TAB 1: EXECUTIVE SUMMARY */}
        {activeTab === 'executive' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column (8 cols) */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              <Card className="border-border bg-surface">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" /> Strategic Direction
                  </CardTitle>
                  <ExplainabilityBadge reasoning={strategy.executive_summary?.reasoning} confidence={strategy.executive_summary?.confidence} />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Market Position</h4>
                        <p className="text-text-secondary text-sm leading-relaxed">{strategy.executive_summary?.current_market_position || 'Not defined'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Growth Opportunities</h4>
                        <p className="text-text-secondary text-sm leading-relaxed">{strategy.executive_summary?.growth_opportunities || 'Not defined'}</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-semibold text-success uppercase tracking-wider mb-2">Success Definition</h4>
                        <p className="text-text-secondary text-sm leading-relaxed">{strategy.executive_summary?.success_definition || 'Not defined'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Top Priority Areas</h4>
                        <ul className="space-y-2.5">
                          {strategy.executive_summary?.priority_areas?.map((p: string, i: number) => (
                            <li key={i} className="text-sm text-text-secondary flex items-start gap-2.5 leading-tight">
                              <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {p}
                            </li>
                          )) || <span className="text-sm text-text-muted">No priorities set.</span>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {strategy.pillars?.map((pillar: any, i: number) => (
                  <Card key={i} className="border-border bg-surface flex flex-col h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4 gap-4">
                        <h4 className="font-bold text-lg text-text-primary leading-tight">{pillar.title}</h4>
                        <span className="text-xs font-medium bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md shrink-0">
                          {pillar.recommended_content_percent}% Mix
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mb-6 flex-grow leading-relaxed">{pillar.description}</p>
                      <div className="pt-4 border-t border-border mt-auto flex justify-between items-center">
                        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{pillar.posting_frequency}</span>
                        <ExplainabilityBadge reasoning={pillar.reasoning} confidence={pillar.confidence} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Column (4 cols) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              <Card className="border-border bg-surface">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Confidence Engine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center -mt-4">
                    {renderConfidenceRadar()}
                  </div>
                  <div className="mt-2 pt-5 border-t border-border space-y-3">
                    <div className="text-sm text-text-secondary flex justify-between items-center">
                      <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary/40"/> Business Data</span>
                      <span className="font-medium text-text-primary">{Math.round(strategy.confidenceBreakdown?.business_confidence * 100 || 0)}%</span>
                    </div>
                    <div className="text-sm text-text-secondary flex justify-between items-center">
                      <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary/60"/> Competitor Data</span>
                      <span className="font-medium text-text-primary">{Math.round(strategy.confidenceBreakdown?.competitor_confidence * 100 || 0)}%</span>
                    </div>
                    <div className="text-sm text-text-secondary flex justify-between items-center">
                      <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary/80"/> Trend Data</span>
                      <span className="font-medium text-text-primary">{Math.round(strategy.confidenceBreakdown?.trend_confidence * 100 || 0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audience Segments */}
              <Card className="border-border bg-surface">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-primary" /> Target Segments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {strategy.audiences?.map((aud: any, i: number) => (
                    <div key={i} className="bg-background border border-border p-4 rounded-xl flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-text-primary mb-1 text-sm">{aud.segment_name}</h4>
                        <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
                          <span className="capitalize">{aud.buying_stage} Stage</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className={aud.opportunity_score > 80 ? 'text-success' : 'text-text-secondary'}>Score: {aud.opportunity_score}</span>
                        </div>
                      </div>
                      <ExplainabilityBadge reasoning={aud.reasoning} confidence={aud.confidence} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: POSITIONING */}
        {activeTab === 'positioning' && strategy.positioning && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
              <Card className="border-border bg-surface">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" /> Market Positioning
                  </CardTitle>
                  <ExplainabilityBadge reasoning={strategy.positioning.reasoning} confidence={strategy.positioning.confidence} />
                </CardHeader>
                <CardContent className="space-y-6 mt-4">
                  <div>
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Unique Value Proposition</h4>
                    <p className="text-lg font-medium text-text-primary italic border-l-4 border-primary pl-4 py-1">
                      "{strategy.positioning.unique_value_proposition}"
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Competitive Advantage</h4>
                    <p className="text-sm text-text-secondary leading-relaxed">{strategy.positioning.competitive_advantage}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background p-4 rounded-xl border border-border">
                      <h4 className="text-xs text-text-muted uppercase font-semibold mb-1">Brand Category</h4>
                      <p className="text-sm font-bold text-primary">{strategy.positioning.brand_category}</p>
                    </div>
                    <div className="bg-background p-4 rounded-xl border border-border">
                      <h4 className="text-xs text-text-muted uppercase font-semibold mb-1">Pricing Position</h4>
                      <p className="text-sm font-bold text-success">{strategy.positioning.pricing_position}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
              {strategy.messaging && (
                 <Card className="border-border bg-surface">
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" /> Messaging Framework
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-sm text-text-secondary mb-6 leading-relaxed bg-background p-4 rounded-xl border border-border">
                       {strategy.messaging.core_brand_message}
                     </p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Trust Builders</h4>
                          <ul className="space-y-2">
                            {strategy.messaging.trust_builders?.map((t: string, i: number) => (
                              <li key={i} className="text-sm text-text-secondary flex gap-2.5 items-start">
                                <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                <span className="leading-tight">{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Proof Points</h4>
                          <ul className="space-y-2">
                            {strategy.messaging.proof_points?.map((t: string, i: number) => (
                              <li key={i} className="text-sm text-text-secondary flex gap-2.5 items-start">
                                <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                <span className="leading-tight">{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                     </div>
                   </CardContent>
                 </Card>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: OPPORTUNITIES */}
        {activeTab === 'opportunities' && (
          <div className="space-y-8">
            {/* Top Recommendations */}
            {strategy.recommendations && strategy.recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-warning" /> High-Priority AI Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(strategy?.recommendations || []).map((rec: any, i: number) => (
                    <Card key={i} className={`border-border bg-surface overflow-hidden ${rec.priority === 'High' ? 'border-l-4 border-l-warning' : 'border-l-4 border-l-border'}`}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3 gap-4">
                          <h4 className="font-bold text-text-primary leading-tight">{rec.title}</h4>
                          <span className={`text-xs px-2.5 py-1 rounded-md font-semibold border shrink-0 ${rec.priority === 'High' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-background text-text-secondary border-border'}`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mb-4 leading-relaxed">{rec.description}</p>
                        <div className="bg-background rounded-lg p-3 border border-border mb-4">
                          <span className="text-xs font-semibold text-text-muted block mb-1">Expected Outcome</span>
                          <span className="text-sm text-text-primary font-medium">{rec.expected_outcome}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" /> Effort: {rec.estimated_effort}
                          </span>
                          <ExplainabilityBadge reasoning={rec.reasoning} confidence={rec.confidence} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Competitor Gaps */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
                  <Map className="w-5 h-5 text-danger" /> Competitor Gap Matrix
                </h3>
                <div className="space-y-4">
                  {strategy.opportunities?.gaps?.map((gap: any, i: number) => (
                    <Card key={i} className="border-border bg-surface">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-danger text-sm">{gap.gap_type} Gap</h4>
                          <span className="text-xs font-medium bg-background text-text-secondary px-2.5 py-1 rounded-md border border-border">
                            Difficulty: {gap.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mb-4">{gap.description}</p>
                        <div className="bg-background p-3.5 rounded-lg border border-border mb-4">
                          <span className="text-xs text-success uppercase font-bold tracking-wider block mb-1">Suggested Solution</span>
                          <p className="text-sm text-text-primary">{gap.suggested_solution}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-border">
                           <span className="text-xs font-medium text-text-muted">Targeting: {gap.competitor_reference}</span>
                           <ExplainabilityBadge reasoning={gap.reasoning} confidence={gap.confidence} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* General Opportunities */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-success" /> Market Growth Vectors
                </h3>
                <div className="space-y-4">
                  {strategy.opportunities?.general?.map((opp: any, i: number) => (
                    <Card key={i} className="border-border bg-surface relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none">
                        <TrendingUp className="w-32 h-32" />
                      </div>
                      <CardContent className="p-5 relative z-10">
                        <div className="flex justify-between items-start mb-3 gap-4">
                          <h4 className="font-bold text-text-primary leading-tight">{opp.title}</h4>
                          <span className="text-xs bg-success/10 text-success border border-success/20 px-2.5 py-1 rounded-md font-bold shrink-0">
                            {opp.opportunity_score} Score
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div className="bg-background border border-border rounded-lg p-3">
                            <strong className="text-xs text-text-muted block mb-1 uppercase tracking-wider">Impact</strong> 
                            <span className="text-text-primary font-medium">{opp.business_impact}</span>
                          </div>
                          <div className="bg-background border border-border rounded-lg p-3">
                            <strong className="text-xs text-text-muted block mb-1 uppercase tracking-wider">Timeline</strong> 
                            <span className="text-text-primary font-medium">{opp.estimated_timeline}</span>
                          </div>
                        </div>
                        <div className="flex justify-end pt-3 border-t border-border">
                           <ExplainabilityBadge reasoning={opp.reasoning} confidence={opp.confidence} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CAMPAIGNS */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {strategy.campaigns?.map((camp: any, i: number) => (
                <Card key={i} className="border-border bg-surface flex flex-col">
                  <div className="p-6 border-b border-border bg-surface-hover/30 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xl text-text-primary mb-1.5">{camp.campaign_name}</h4>
                      <div className="flex items-center gap-3 text-xs font-medium text-text-secondary">
                        <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5"/> {camp.duration}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-primary">{camp.budget_recommendation}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${camp.priority === 'High' ? 'bg-danger/10 text-danger border-danger/20' : 'bg-background text-text-secondary border-border'}`}>
                      {camp.priority}
                    </span>
                  </div>
                  
                  <CardContent className="p-6 flex-grow space-y-6">
                    <div>
                      <h5 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Campaign Goal</h5>
                      <p className="text-sm text-text-primary font-medium">{camp.campaign_goal}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Description</h5>
                      <p className="text-sm text-text-secondary leading-relaxed">{camp.campaign_description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border">
                      <div>
                        <h5 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Platforms</h5>
                        <div className="flex flex-wrap gap-2">
                          {camp.platforms?.map((p: string, j: number) => (
                            <span key={j} className="text-xs font-medium bg-background text-text-secondary border border-border px-2.5 py-1 rounded-md">{p}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Core KPIs</h5>
                        <div className="flex flex-wrap gap-2">
                          {camp.kpis?.map((k: string, j: number) => (
                            <span key={j} className="text-xs font-medium bg-success/10 border border-success/20 text-success px-2.5 py-1 rounded-md">{k}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <div className="bg-surface-hover/30 p-5 border-t border-border flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-text-muted" />
                      <span className="text-xs font-medium text-text-secondary">Target: {camp.target_audience}</span>
                    </div>
                    <ExplainabilityBadge reasoning={camp.reasoning} confidence={camp.confidence} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ROADMAP */}
        {activeTab === 'roadmap' && (
          <div className="space-y-8">
             <div>
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
                  <CalendarDays className="w-5 h-5 text-primary" /> Weekly Execution Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {strategy.weekly?.sort((a: any, b: any) => a.week_number - b.week_number).map((week: any, i: number) => (
                    <Card key={i} className="border-border bg-surface flex flex-col relative overflow-hidden group hover:border-primary/50 transition-colors">
                      <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
                      <CardContent className="p-5 flex flex-col h-full pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-black text-primary bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm">
                            W{week.week_number}
                          </span>
                          <ExplainabilityBadge reasoning={week.reasoning} confidence={week.confidence} />
                        </div>
                        <h4 className="font-bold text-text-primary mb-2 leading-tight">{week.objective}</h4>
                        <p className="text-sm text-text-secondary mb-6 flex-grow">{week.strategic_focus}</p>
                        
                        <div className="space-y-3 pt-4 border-t border-border mt-auto">
                          <div>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Primary Campaign</span> 
                            <span className="text-sm font-medium text-text-primary flex items-center gap-1.5"><Presentation className="w-3.5 h-3.5 text-primary" /> {week.primary_campaign}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Expected KPI</span> 
                            <span className="text-sm font-bold text-success flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> {week.expected_kpi}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             </div>
          </div>
        )}

        {/* TAB 6: RISKS & METRICS */}
        {activeTab === 'risks' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div>
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-5 h-5 text-danger" /> Risk Assessment
                </h3>
                <div className="space-y-4">
                  {strategy.risks?.map((risk: any, i: number) => (
                    <Card key={i} className="border-border bg-surface">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-text-primary text-sm">{risk.risk_type}</h4>
                          <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${risk.priority === 'High' ? 'bg-danger/10 text-danger border-danger/20' : 'bg-background text-text-secondary border-border'}`}>
                            {risk.priority} Risk
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mb-4 leading-relaxed">{risk.description}</p>
                        <div className="bg-success/5 p-4 rounded-xl border border-success/20">
                          <span className="text-xs text-success uppercase font-bold tracking-wider block mb-1.5 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" /> Mitigation Strategy
                          </span>
                          <p className="text-sm text-text-primary">{risk.mitigation_strategy}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             </div>
             
             <div>
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-success" /> Key Performance Indicators
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {strategy.metrics?.map((metric: any, i: number) => (
                    <Card key={i} className="border-border bg-surface">
                      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-text-primary mb-1 text-sm">{metric.metric_name}</h4>
                          <p className="text-sm text-text-secondary">{metric.expected_improvement}</p>
                        </div>
                        <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:gap-2">
                          <div className="text-xl font-black text-success">{metric.target}</div>
                          <ExplainabilityBadge reasoning={metric.reasoning} confidence={metric.confidence} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StrategyPlanner;

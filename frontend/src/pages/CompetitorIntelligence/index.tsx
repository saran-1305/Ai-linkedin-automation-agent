import React, { useState, useEffect } from 'react';
import { Users, PlusCircle, RefreshCw, Crosshair, Target, ShieldAlert, Zap, Globe, MessageSquare, Trash2, Building2 } from 'lucide-react';
import { httpClient as api } from '../../services/api/httpClient';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const CompetitorIntelligencePage: React.FC = () => {
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCompetitors = async () => {
    try {
      const response = await api.get('/market/competitors');
      setCompetitors(response.data);
    } catch (error) {
      console.error("Failed to fetch competitors", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !website) return;
    
    setSubmitting(true);
    try {
      await api.post('/market/competitors', {
        company_name: companyName,
        website: website
      });
      setShowForm(false);
      setCompanyName('');
      setWebsite('');
      // Optimistic fetch
      fetchCompetitors();
      
      // Wait for AI Analysis to complete
      setTimeout(fetchCompetitors, 8000);
      setTimeout(fetchCompetitors, 15000);
    } catch (error) {
      console.error("Failed to add competitor", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async (id: number) => {
    setRefreshingId(id);
    try {
      await api.post(`/market/competitors/${id}/refresh`);
      setTimeout(fetchCompetitors, 8000);
      setTimeout(fetchCompetitors, 15000);
    } catch (error) {
      console.error("Failed to trigger refresh", error);
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this competitor?")) return;
    try {
      await api.delete(`/market/competitors/${id}`);
      fetchCompetitors();
    } catch (error) {
      console.error("Failed to delete competitor", error);
    }
  };

  return (
    <div className="space-y-6 animate-in pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Competitor Intelligence</h2>
          <p className="text-text-secondary mt-1">Track and analyze competitor content, gaps, and market positioning.</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'outline' : 'primary'}
          className="gap-2"
        >
          {showForm ? 'Cancel' : <><PlusCircle className="w-4 h-4" /> Add Competitor</>}
        </Button>
      </div>

      {/* Add Competitor Form */}
      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Add New Competitor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCompetitor} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Company Name</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus-ring"
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Website URL</label>
                <input 
                  type="url" 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary focus-ring"
                  placeholder="https://acme.com"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full md:w-auto h-[42px] px-6"
              >
                {submitting ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
                ) : 'Track Competitor'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-text-muted animate-pulse">Loading competitors...</p>
        </div>
      ) : competitors.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed bg-transparent p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Building2 className="w-8 h-8 text-primary opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">No Competitors Tracked</h3>
          <p className="text-text-secondary max-w-md mx-auto mb-8">
            Start tracking your market by adding competitors. The AI will automatically analyze their strategy and generate a SWOT profile against your brand.
          </p>
          <Button onClick={() => setShowForm(true)} variant="outline">
            Add Your First Competitor
          </Button>
        </Card>
      ) : (
        /* Competitor List */
        <div className="space-y-6">
          {competitors.map((comp) => (
            <Card key={comp.id} className="overflow-hidden border-border bg-surface">
              {/* Competitor Header */}
              <div className="p-6 border-b border-border bg-surface-hover/50 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                      {comp.company_name}
                    </h3>
                    {comp.latest_profile?.positioning && (
                      <span className="text-xs font-medium px-2.5 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                        {comp.latest_profile.positioning}
                      </span>
                    )}
                  </div>
                  <a href={comp.website} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary text-sm flex items-center gap-1.5 transition-colors w-fit">
                    <Globe className="w-4 h-4" /> {comp.website}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleRefresh(comp.id)}
                    disabled={refreshingId === comp.id}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshingId === comp.id ? 'animate-spin' : ''}`} />
                    {refreshingId === comp.id ? 'Analyzing...' : 'Refresh'}
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(comp.id)}
                    className="text-text-muted hover:text-danger hover:bg-danger/10"
                    title="Delete Competitor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Competitor Content */}
              {!comp.latest_swot ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-text-primary font-medium mb-1">AI is currently analyzing {comp.company_name}'s website.</p>
                  <p className="text-sm text-text-secondary">This usually takes about 10-20 seconds. Grab a coffee!</p>
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* SWOT Grid (8 columns) */}
                  <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="bg-success/5 border border-success/20 rounded-xl p-5">
                      <h4 className="text-success font-semibold mb-3 flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4" /> Strengths
                      </h4>
                      <ul className="space-y-2 text-sm text-text-secondary list-disc pl-4 marker:text-success/50">
                        {(comp.latest_swot?.strengths || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    
                    {/* Weaknesses */}
                    <div className="bg-danger/5 border border-danger/20 rounded-xl p-5">
                      <h4 className="text-danger font-semibold mb-3 flex items-center gap-2 text-sm">
                        <ShieldAlert className="w-4 h-4" /> Weaknesses
                      </h4>
                      <ul className="space-y-2 text-sm text-text-secondary list-disc pl-4 marker:text-danger/50">
                        {(comp.latest_swot?.weaknesses || []).map((w: string, i: number) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>

                    {/* Opportunities */}
                    <div className="bg-info/5 border border-info/20 rounded-xl p-5">
                      <h4 className="text-info font-semibold mb-3 flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4" /> Opportunities
                      </h4>
                      <ul className="space-y-2 text-sm text-text-secondary list-disc pl-4 marker:text-info/50">
                        {(comp.latest_swot?.opportunities || []).map((o: string, i: number) => <li key={i}>{o}</li>)}
                      </ul>
                    </div>

                    {/* Threats */}
                    <div className="bg-warning/5 border border-warning/20 rounded-xl p-5">
                      <h4 className="text-warning font-semibold mb-3 flex items-center gap-2 text-sm">
                        <Crosshair className="w-4 h-4" /> Threats
                      </h4>
                      <ul className="space-y-2 text-sm text-text-secondary list-disc pl-4 marker:text-warning/50">
                        {(comp.latest_swot?.threats || []).map((t: string, i: number) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* Gap Analysis Sidebar (4 columns) */}
                  <div className="xl:col-span-4 space-y-4 flex flex-col">
                    <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Gap Analysis</h4>
                    
                    {comp.latest_analysis?.messaging_gap && (
                      <div className="bg-background rounded-xl p-5 border border-border flex-1">
                        <h4 className="text-text-primary font-semibold mb-2 flex items-center gap-2 text-sm">
                          <MessageSquare className="w-4 h-4 text-purple-400" /> Messaging Gap
                        </h4>
                        <p className="text-sm text-text-secondary leading-relaxed">{comp.latest_analysis.messaging_gap}</p>
                      </div>
                    )}
                    
                    {comp.latest_analysis?.content_gap && (
                      <div className="bg-background rounded-xl p-5 border border-border flex-1">
                        <h4 className="text-text-primary font-semibold mb-2 flex items-center gap-2 text-sm">
                          <MessageSquare className="w-4 h-4 text-blue-400" /> Content Gap
                        </h4>
                        <p className="text-sm text-text-secondary leading-relaxed">{comp.latest_analysis.content_gap}</p>
                      </div>
                    )}
                    
                    {comp.latest_analysis?.keyword_gap && (
                      <div className="bg-background rounded-xl p-5 border border-border flex-1">
                        <h4 className="text-text-primary font-semibold mb-2 flex items-center gap-2 text-sm">
                          <MessageSquare className="w-4 h-4 text-emerald-400" /> Keyword Gap
                        </h4>
                        <p className="text-sm text-text-secondary leading-relaxed">{comp.latest_analysis.keyword_gap}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompetitorIntelligencePage;

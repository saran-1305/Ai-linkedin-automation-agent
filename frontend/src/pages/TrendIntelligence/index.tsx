import React, { useState, useEffect } from 'react';
import { TrendingUp, PlusCircle, RefreshCw, ExternalLink, Clock, Newspaper, Activity } from 'lucide-react';
import { httpClient as api } from '../../services/api/httpClient';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const TrendIntelligencePage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrends = async () => {
    try {
      const response = await api.get('/market/trends');
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch trends", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post('/market/trends/refresh');
      // Wait a few seconds for background job to collect some data
      await new Promise(resolve => setTimeout(resolve, 3000));
      await fetchTrends();
    } catch (error) {
      console.error("Failed to trigger refresh", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Trend Intelligence</h2>
          <p className="text-text-secondary mt-1">Discover emerging market trends, news, and viral topics.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Add Data Source
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-text-muted animate-pulse">Scanning market trends...</p>
        </div>
      ) : !data?.latest_news?.length ? (
        /* Empty State */
        <Card className="border-dashed bg-transparent p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <TrendingUp className="w-8 h-8 text-primary opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">No Market Data Yet</h3>
          <p className="text-text-secondary max-w-md mx-auto mb-8">
            Click refresh to run the background collectors and fetch live data from Google News and other sources.
          </p>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Fetching...' : 'Fetch Live Trends'}
          </Button>
        </Card>
      ) : (
        /* Content Area */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Feed (8 columns) */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Live Market Feed
            </h3>
            <div className="space-y-4">
              {(data?.latest_news || []).map((news: any) => {
                const lines = news.raw_text.split('\\n');
                const title = lines[0]?.replace('Title: ', '') || 'Untitled';
                const summary = lines[2]?.replace('Summary: ', '') || news.raw_text;

                return (
                  <Card key={news.id} className="border-border bg-surface hover:bg-surface-hover/30 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full border border-primary/20">
                          {news.source_provider}
                        </span>
                        {news.published_date && (
                          <span className="text-text-muted flex items-center gap-1.5 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(news.published_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="text-lg font-semibold text-text-primary mb-2 leading-tight">
                        {title}
                      </h4>
                      
                      <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-3">
                        {summary}
                      </p>
                      
                      <div className="pt-4 border-t border-border flex justify-between items-center mt-auto">
                        <a 
                          href={news.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1.5 transition-colors"
                        >
                          Read Full Article <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          
          {/* Sidebar (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-border bg-surface sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-text-muted" />
                  Active Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(data?.sources || []).map((source: any) => (
                  <div key={source.id} className="flex items-center justify-between p-3.5 bg-background rounded-lg border border-border">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-text-primary font-medium text-sm truncate">{source.name}</p>
                      <p className="text-text-muted text-xs truncate mt-0.5" title={source.url_or_query}>
                        {source.url_or_query}
                      </p>
                    </div>
                    <span className="bg-success/10 text-success text-xs font-semibold px-2 py-1 rounded-md border border-success/20 whitespace-nowrap">
                      Active
                    </span>
                  </div>
                ))}
                
                {data.sources.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-text-secondary text-sm">No active sources configured.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendIntelligencePage;

import { useState, useEffect, useCallback } from 'react';
import { httpClient } from '../../../services/api/httpClient';

export const useBrandIntelligence = () => {
  const [profile, setProfile] = useState<any>(null);
  const [voice, setVoice] = useState<any[]>([]);
  const [personality, setPersonality] = useState<any[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [audiences, setAudiences] = useState<any[]>([]);
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [storytelling, setStorytelling] = useState<any[]>([]);
  const [ctaPatterns, setCtaPatterns] = useState<any[]>([]);
  const [postingPatterns, setPostingPatterns] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBrandData = useCallback(async () => {
    try {
      setLoading(true);
      
      const endpoints = [
        '/brand/profile', '/brand/voice', '/brand/personality', '/brand/content-pillars',
        '/brand/topics', '/brand/keywords', '/brand/audiences', '/brand/vocabulary',
        '/brand/storytelling-patterns', '/brand/cta-patterns', '/brand/posting-patterns',
        '/brand/versions'
      ];

      const results = await Promise.allSettled(endpoints.map(ep => httpClient.get(ep)));

      const getData = (index: number) => {
        const res = results[index];
        return res.status === 'fulfilled' ? res.value.data : null;
      };

      setProfile(getData(0));
      setVoice(getData(1) || []);
      setPersonality(getData(2) || []);
      setPillars(getData(3) || []);
      setTopics(getData(4) || []);
      setKeywords(getData(5) || []);
      setAudiences(getData(6) || []);
      setVocabulary(getData(7) || []);
      setStorytelling(getData(8) || []);
      setCtaPatterns(getData(9) || []);
      setPostingPatterns(getData(10));
      setVersions(getData(11) || []);
      
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load Brand Intelligence data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrandData();
  }, [fetchBrandData]);

  const regenerateProfile = async () => {
    try {
      setRegenerating(true);
      await httpClient.post('/brand/regenerate');
      // Poll or wait, but for now we just show regenerating
      setTimeout(() => {
        fetchBrandData();
        setRegenerating(false);
      }, 5000); // Check back in 5 seconds
    } catch (err) {
      console.error(err);
      setRegenerating(false);
    }
  };

  const exportProfile = () => {
    if (!profile) return;
    const data = {
      profile, voice, personality, pillars, topics, keywords,
      audiences, vocabulary, storytelling, ctaPatterns, postingPatterns
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brand_brain_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    profile,
    voice,
    personality,
    pillars,
    topics,
    keywords,
    audiences,
    vocabulary,
    storytelling,
    ctaPatterns,
    postingPatterns,
    versions,
    loading,
    regenerating,
    error,
    regenerateProfile,
    exportProfile,
    refreshData: fetchBrandData
  };
};

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, XCircle, RefreshCw, Smartphone, Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';
import { publishingApi } from '../../services/api/publishingApi';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { PlatformHealth } from './components/PlatformHealth';
import { PublishingHistory } from './components/PublishingHistory';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export const PublishingCenter = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'approved'>('queue');
  const [jobs, setJobs] = useState<any[]>([]);
  const [approvedContent, setApprovedContent] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [jobsRes, accountsRes, approvedRes] = await Promise.all([
        publishingApi.getJobs(),
        publishingApi.getAccounts(),
        publishingApi.getApprovedContent()
      ]);
      setJobs(jobsRes.data);
      setAccounts(accountsRes.data);
      setApprovedContent(approvedRes.data);
      
      const events = (jobsRes.data || []).map((job: any) => ({
        id: job.id,
        title: `[${job.status}] ${job.platform}`,
        start: job.scheduled_time || job.published_at || new Date().toISOString(),
        backgroundColor: job.status === 'Published' ? 'var(--color-success)' : job.status === 'Failed' ? 'var(--color-danger)' : 'var(--color-primary)',
        borderColor: 'transparent'
      }));
      setCalendarEvents(events);
      
    } catch (e) {
      console.error('Failed to load publishing data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-switch to approved tab if queue is empty and approved content exists
  useEffect(() => {
    if (!loading && jobs.length === 0 && approvedContent.length > 0) {
      setActiveTab('approved');
    }
  }, [loading, jobs.length, approvedContent.length]);

  const handleConnectPlatform = async (platform: string) => {
    try {
      const res = await publishingApi.getAuthUrl(platform);
      if (res.data && res.data.url) {
        localStorage.setItem('oauth_platform_name', platform);
        window.location.href = res.data.url;
      }
    } catch (e) {
      alert("Failed to get authorization URL. Check if your client credentials are set in .env.");
    }
  };

  const handleRetry = async (jobId: number) => {
    try {
      await publishingApi.retryJob(jobId);
      alert("Retry scheduled!");
      await fetchData();
    } catch (e) {
      alert("Failed to retry");
    }
  };

  const handleCancelJob = async (jobId: number) => {
    if (confirm("Are you sure you want to cancel this scheduled post?")) {
      try {
        await publishingApi.cancelJob(jobId);
        await fetchData();
      } catch (e) {
        alert("Failed to cancel job");
      }
    }
  };

  const handleEventDrop = async (info: any) => {
    const jobId = info.event.id;
    const newDate = info.event.start;
    
    if(confirm(`Reschedule this post to ${newDate.toLocaleString()}?`)) {
      try {
        await publishingApi.rescheduleJob(jobId, newDate.toISOString());
        alert("Post rescheduled successfully!");
        fetchData();
      } catch (e) {
        alert("Failed to reschedule post.");
        info.revert();
      }
    } else {
      info.revert();
    }
  };

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleModalData, setScheduleModalData] = useState<{
    type: 'edit_job' | 'schedule_approved';
    id: number;
    platform?: string;
    currentDate: string;
  } | null>(null);

  const formatForInput = (isoString: string) => {
    try {
      if (!isoString) return '';
      const d = new Date(isoString);
      return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const handleEditSchedule = (jobId: number, currentSchedule: string) => {
    setScheduleModalData({
      type: 'edit_job',
      id: jobId,
      currentDate: formatForInput(currentSchedule || new Date().toISOString())
    });
    setScheduleModalOpen(true);
  };

  const handlePublishApproved = async (contentId: number, platform: string) => {
    try {
      await publishingApi.publishGeneratedContentNow(contentId, platform);
      alert('Content successfully sent to publishing queue!');
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Failed to publish content. Please check account connection.');
    }
  };

  const handleScheduleApproved = (contentId: number, platform: string) => {
    setScheduleModalData({
      type: 'schedule_approved',
      id: contentId,
      platform,
      currentDate: formatForInput(new Date().toISOString())
    });
    setScheduleModalOpen(true);
  };

  const submitSchedule = async (timeStr: string) => {
    if (!scheduleModalData) return;
    try {
      const isoDate = new Date(timeStr).toISOString();
      if (scheduleModalData.type === 'edit_job') {
        await publishingApi.rescheduleJob(scheduleModalData.id, isoDate);
        alert('Content rescheduled successfully!');
      } else if (scheduleModalData.type === 'schedule_approved' && scheduleModalData.platform) {
        await publishingApi.scheduleGeneratedContent(scheduleModalData.id, scheduleModalData.platform, isoDate);
        alert('Content scheduled successfully!');
      }
      setScheduleModalOpen(false);
      fetchData();
    } catch (e: any) {
      console.error(e);
      const msg = e.response?.data?.detail || e.message || 'Unknown error occurred.';
      alert(`Failed to schedule content: ${msg}`);
    }
  };

  const handleDeleteApproved = async (contentId: number) => {
    if (confirm('Are you sure you want to remove this draft from the approval queue?')) {
      try {
        await publishingApi.archiveApprovedContent(contentId);
        fetchData();
      } catch (e) {
        console.error(e);
        alert('Failed to delete content.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Publishing Center
          </h2>
          <p className="text-text-secondary mt-1">Manage platform accounts, monitor the queue, and collaborate on approvals.</p>
        </div>
        
        <div className="flex gap-2 p-1 bg-surface border border-border rounded-lg shadow-sm">
          <button 
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
              activeTab === 'queue' 
              ? 'bg-text-primary text-background shadow-sm' 
              : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Publishing Queue
          </button>
          <button 
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'approved' 
              ? 'bg-text-primary text-background shadow-sm' 
              : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <CheckCircle className="w-4 h-4" /> 
            Inbox
            {approvedContent.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'approved' ? 'bg-background text-text-primary' : 'bg-primary text-primary-foreground'}`}>
                {approvedContent.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'queue' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Calendar & Accounts (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Calendar View */}
            <Card className="border-border bg-surface h-[600px] overflow-hidden">
              <div className="h-full p-4 fullcalendar-custom-theme">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek'
                  }}
                  events={calendarEvents}
                  editable={true}
                  droppable={true}
                  eventDrop={handleEventDrop}
                  height="100%"
                />
              </div>
            </Card>

            {/* Connected Accounts & Platform Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card className="border-border bg-surface">
                <CardHeader>
                  <CardTitle className="text-lg">Platform Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  {accounts.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-text-secondary mb-4 text-sm">No platform accounts connected.</p>
                      <div className="flex justify-center gap-3">
                        {['LinkedIn', 'X'].map(p => (
                          <Button 
                            key={p}
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnectPlatform(p)}
                          >
                            Connect {p}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {accounts.map(acc => (
                        <div key={acc.id} className="bg-background border border-border p-3.5 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-primary" />
                            <div>
                              <div className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                                {acc.platform_name} 
                                {acc.is_connected ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <XCircle className="w-3.5 h-3.5 text-danger" />}
                              </div>
                              <div className="text-xs text-text-secondary">{acc.account_name}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-border flex flex-wrap gap-2 mt-4">
                        {['LinkedIn', 'X'].map(p => (
                          <Button 
                            key={p}
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnectPlatform(p)}
                            className="text-xs h-7 px-3"
                          >
                            + Connect {p}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Platform Health Dashboard */}
              <PlatformHealth />
              
            </div>
          </div>

          {/* Right Column: Queue & Timeline (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Publishing Queue */}
            <Card className="border-border bg-surface flex flex-col h-[400px]">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="flex justify-between items-center text-lg">
                  <span>Publishing Queue</span>
                  <button onClick={fetchData} className="text-text-muted hover:text-primary transition-colors">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="space-y-3">
                  {jobs.length === 0 ? (
                    <div className="text-center py-12 text-text-secondary">
                      <Send className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                      <p className="text-sm font-medium">Queue is empty.</p>
                    </div>
                  ) : (
                    jobs.map(job => (
                      <div key={job.id} className="bg-background border border-border p-4 rounded-xl hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-2 items-center">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                              {job.platform}
                            </span>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                              job.status === 'Published' ? 'bg-success/10 text-success border-success/20' :
                              job.status === 'Failed' ? 'bg-danger/10 text-danger border-danger/20' :
                              job.status === 'Scheduled' ? 'bg-warning/10 text-warning border-warning/20' :
                              'bg-info/10 text-info border-info/20'
                            }`}>
                              {job.status}
                            </span>
                          </div>
                          
                          {job.status === 'Failed' && (
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleRetry(job.id)}
                                className="px-2 py-1 bg-surface border border-border hover:bg-surface-hover hover:text-primary text-text-secondary rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                              >
                                <RefreshCw className="w-3 h-3" /> Retry
                              </button>
                              <button 
                                onClick={() => handleCancelJob(job.id)}
                                className="text-text-muted hover:text-danger transition-colors p-1"
                                title="Delete failed post"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          {job.status === 'Scheduled' && (
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleEditSchedule(job.id, job.scheduled_time)}
                                className="text-text-muted hover:text-primary transition-colors p-1"
                                title="Edit scheduled time"
                              >
                                <CalendarIcon className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleCancelJob(job.id)}
                                className="text-text-muted hover:text-danger transition-colors p-1"
                                title="Cancel scheduled post"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-xs text-text-secondary font-medium flex items-center gap-1.5 mb-2">
                          <Clock className="w-3.5 h-3.5" />
                          {job.scheduled_time ? `Scheduled: ${new Date(job.scheduled_time).toLocaleString()}` : 'Immediate Publish'}
                        </div>
  
                        {job.readiness_score !== undefined && (
                          <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-success" /> Readiness
                            </span>
                            <span className={`text-xs font-black ${job.readiness_score >= 80 ? 'text-success' : 'text-warning'}`}>
                              {job.readiness_score}/100
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Publishing History */}
            <PublishingHistory jobs={jobs} />
            
          </div>
        </div>
      ) : (
        <Card className="border-border bg-surface min-h-[600px]">
          <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-success" /> Approved Drafts Inbox
              </CardTitle>
              <p className="text-text-secondary text-sm mt-1">Content approved in the Generator, ready for publishing or scheduling.</p>
            </div>
            <Button variant="outline" onClick={fetchData} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedContent.length === 0 ? (
                <div className="col-span-full text-center py-24 bg-background rounded-xl border border-border border-dashed">
                  <CheckCircle className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-bold text-text-primary mb-2">Inbox Empty</h4>
                  <p className="text-text-secondary max-w-sm mx-auto font-medium">You have no approved drafts waiting. Go to the Content Engine to approve new content variations.</p>
                </div>
              ) : (
                approvedContent.map(content => (
                  <Card key={content.id} className="bg-background border border-border hover:border-primary/50 transition-colors flex flex-col justify-between">
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">{content.platform}</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{new Date(content.approved_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-text-primary font-bold mb-2 text-sm line-clamp-2 leading-snug">{content.draft_title}</h4>
                      <p className="text-text-secondary text-xs line-clamp-4 leading-relaxed mb-6 font-medium">
                        {content.body_preview}
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-border flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => handleScheduleApproved(content.id, content.platform)}
                          className="flex-1 text-xs gap-1.5 h-8 bg-surface hover:bg-surface-hover"
                          title="Schedule for later"
                        >
                          <CalendarIcon className="w-3 h-3" /> Schedule
                        </Button>
                        <Button 
                          onClick={() => handlePublishApproved(content.id, content.platform)}
                          className="flex-1 text-xs gap-1.5 h-8"
                          title="Publish immediately"
                        >
                          <Send className="w-3 h-3" /> Publish
                        </Button>
                        <Button 
                          variant="ghost"
                          onClick={() => handleDeleteApproved(content.id)}
                          className="px-2 h-8 text-text-muted hover:text-danger hover:bg-danger/10"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {scheduleModalOpen && scheduleModalData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-surface border-border shadow-2xl">
            <CardHeader>
              <CardTitle>Schedule Post</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Select Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-background border border-border rounded-lg p-3 text-text-primary focus:border-primary outline-none mb-4"
                    defaultValue={scheduleModalData.currentDate.split('T')[0]}
                    id="schedule-date-input"
                  />
                  <label className="block text-sm font-medium text-text-secondary mb-2">Select Time</label>
                  <div className="flex items-center gap-2">
                    <select id="schedule-hour-input" className="flex-1 bg-background border border-border rounded-lg p-3 text-text-primary focus:border-primary outline-none" defaultValue={
                      (() => {
                        const h = parseInt(scheduleModalData.currentDate.split('T')[1]?.split(':')[0] || '12');
                        let hour12 = h % 12;
                        if (hour12 === 0) hour12 = 12;
                        return hour12.toString().padStart(2, '0');
                      })()
                    }>
                      {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-text-primary font-bold">:</span>
                    <select id="schedule-minute-input" className="flex-1 bg-background border border-border rounded-lg p-3 text-text-primary focus:border-primary outline-none" defaultValue={
                      scheduleModalData.currentDate.split('T')[1]?.split(':')[1] || '00'
                    }>
                      {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select id="schedule-ampm-input" className="flex-1 bg-background border border-border rounded-lg p-3 text-text-primary focus:border-primary outline-none" defaultValue={
                      parseInt(scheduleModalData.currentDate.split('T')[1]?.split(':')[0] || '12') >= 12 ? 'PM' : 'AM'
                    }>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <Button variant="outline" onClick={() => setScheduleModalOpen(false)}>Cancel</Button>
                  <Button onClick={() => {
                    const dateVal = (document.getElementById('schedule-date-input') as HTMLInputElement)?.value;
                    const hVal = parseInt((document.getElementById('schedule-hour-input') as HTMLSelectElement)?.value);
                    const mVal = (document.getElementById('schedule-minute-input') as HTMLSelectElement)?.value;
                    const ampm = (document.getElementById('schedule-ampm-input') as HTMLSelectElement)?.value;
                    
                    if (dateVal && hVal && mVal && ampm) {
                      let hour24 = hVal;
                      if (ampm === 'PM' && hour24 < 12) hour24 += 12;
                      if (ampm === 'AM' && hour24 === 12) hour24 = 0;
                      
                      const timeStr = `${dateVal}T${hour24.toString().padStart(2, '0')}:${mVal}`;
                      submitSchedule(timeStr);
                    }
                  }}>Save Schedule</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Global CSS for FullCalendar dark mode override */}
      <style dangerouslySetInnerHTML={{__html: `
        .fullcalendar-custom-theme .fc-theme-standard td, 
        .fullcalendar-custom-theme .fc-theme-standard th { 
          border-color: var(--color-border); 
        }
        .fullcalendar-custom-theme .fc .fc-toolbar-title { 
          font-size: 1.25rem; 
          font-weight: 700; 
          color: var(--color-text-primary); 
        }
        .fullcalendar-custom-theme .fc .fc-button-primary { 
          background-color: var(--color-surface); 
          border-color: var(--color-border); 
          color: var(--color-text-primary);
          font-weight: 600;
        }
        .fullcalendar-custom-theme .fc .fc-button-primary:hover { 
          background-color: var(--color-surface-hover); 
          border-color: var(--color-border); 
        }
        .fullcalendar-custom-theme .fc .fc-button-primary:disabled { 
          background-color: var(--color-background); 
          border-color: var(--color-border); 
          opacity: 0.5;
        }
        .fullcalendar-custom-theme .fc .fc-button-active { 
          background-color: var(--color-primary) !important; 
          border-color: var(--color-primary) !important; 
          color: var(--color-background) !important;
        }
        .fullcalendar-custom-theme .fc-daygrid-day-number { 
          color: var(--color-text-secondary); 
          font-weight: 500;
        }
        .fullcalendar-custom-theme .fc-day-today { 
          background-color: var(--color-primary-transparent) !important; 
        }
      `}} />
    </div>
  );
};

export default PublishingCenter;

import React, { useEffect, useRef, useState } from 'react';
import { Bell, Clock, Inbox, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalsApi } from '../../services/api/approvalsApi';
import { notificationsApi, type Notification } from '../../services/api/notificationsApi';
import { cn } from '../../utils/cn';

const POLL_INTERVAL_MS = 60_000;

const timeUntil = (isoDate: string): string => {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  if (diffMs <= 0) return 'expired';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return '<1h left';
  if (hours < 24) return `${hours}h left`;
  return `${Math.floor(hours / 24)}d left`;
};

const formatTimeAgo = (isoDate: string): string => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  const { data: pending, isLoading: loadingApprovals } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: approvalsApi.getPending,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const { data: notifications, isLoading: loadingNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getNotifications,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const markAsRead = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadNotifications = notifications?.filter(n => !n.is_read) || [];
  const count = (pending?.length || 0) + unreadNotifications.length;
  const isLoading = loadingApprovals || loadingNotifications;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative text-text-secondary hover:text-text-primary transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-surface border border-border py-1 animate-in z-20">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-semibold text-text-primary">Pending Approvals</p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
              </div>
            )}

            {!isLoading && count === 0 && notifications?.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
                <Inbox className="w-6 h-6 text-text-muted" />
                <p className="text-xs text-text-muted">You're all caught up!</p>
              </div>
            )}

            {!isLoading && pending?.map((item) => (
              <div key={`approval-${item.token}`} className="px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-hover">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
                    {item.platform_name || 'Post'} Approval
                  </span>
                  <span className={cn(
                    "text-[10px] font-semibold flex items-center gap-1",
                    timeUntil(item.expires_at) === 'expired' ? 'text-danger' : 'text-warning'
                  )}>
                    <Clock className="w-3 h-3" /> {timeUntil(item.expires_at)}
                  </span>
                </div>
                <p className="text-xs text-text-secondary line-clamp-2">
                  {item.content_preview || 'No preview available.'}
                </p>
                {item.recipient_email && (
                  <p className="text-[11px] text-text-muted mt-1">Awaiting {item.recipient_email}</p>
                )}
              </div>
            ))}

            {!isLoading && notifications?.map((item) => (
              <div 
                key={`notif-${item.id}`} 
                onClick={() => {
                  if (!item.is_read) markAsRead.mutate(item.id);
                }}
                className={cn(
                  "px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-hover cursor-pointer transition-colors",
                  !item.is_read ? 'bg-primary/5' : ''
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-xs font-bold uppercase tracking-wide", !item.is_read ? 'text-primary' : 'text-text-primary')}>
                    {item.title}
                  </span>
                  <span className="text-[10px] text-text-muted font-medium">
                    {formatTimeAgo(item.created_at)}
                  </span>
                </div>
                <p className={cn("text-xs line-clamp-2", !item.is_read ? 'text-text-primary font-medium' : 'text-text-secondary')}>
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

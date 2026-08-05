import React from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle2, CircleDashed, Clock, Lock, AlertTriangle, XCircle, Activity, PlayCircle, Loader2 } from 'lucide-react';

export type StatusType = 
  | 'Completed' 
  | 'Healthy' 
  | 'Running' 
  | 'Processing' 
  | 'Waiting' 
  | 'Locked' 
  | 'Warning' 
  | 'Error'
  | 'Disconnected'
  | 'Idle';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<StatusType, { colorClass: string; icon: React.ElementType }> = {
  Completed: { colorClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]', icon: CheckCircle2 },
  Healthy: { colorClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]', icon: Activity },
  Running: { colorClass: 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]', icon: PlayCircle },
  Processing: { colorClass: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.3)]', icon: Loader2 },
  Waiting: { colorClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', icon: Clock },
  Idle: { colorClass: 'bg-slate-500/10 text-slate-300 border border-slate-500/30', icon: CircleDashed },
  Locked: { colorClass: 'bg-slate-800 text-slate-500 border border-slate-700', icon: Lock },
  Warning: { colorClass: 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]', icon: AlertTriangle },
  Error: { colorClass: 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]', icon: XCircle },
  Disconnected: { colorClass: 'bg-slate-800 text-slate-500 border border-slate-700', icon: XCircle },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, showIcon = true }) => {
  const config = statusConfig[status] || statusConfig.Waiting;
  const Icon = config.icon;

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide",
        config.colorClass,
        className
      )}
    >
      {showIcon && (
        <Icon className={cn("w-3.5 h-3.5 mr-1.5", (status === 'Processing' || status === 'Running') && 'animate-spin')} />
      )}
      {(status === 'Healthy' || status === 'Running' || status === 'Processing') && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {status}
    </span>
  );
};

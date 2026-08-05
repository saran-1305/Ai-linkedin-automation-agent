import * as React from "react";
import { cn } from "../../utils/cn";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Lock, 
  PlayCircle, 
  Loader2, 
  AlertCircle,
  type LucideIcon
} from "lucide-react";

export type StatusVariant = 
  | 'Completed' 
  | 'Available' 
  | 'Active' 
  | 'Pending' 
  | 'Waiting' 
  | 'Running' 
  | 'Processing' 
  | 'Locked' 
  | 'Error'
  | 'default'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: StatusVariant;
  showIcon?: boolean;
}

const statusConfig: Record<string, { className: string, Icon: LucideIcon | null }> = {
  Completed: { className: "border-transparent bg-success text-white hover:bg-success/80", Icon: CheckCircle2 },
  Available: { className: "border-transparent bg-info text-white hover:bg-info/80", Icon: Circle },
  Active: { className: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80", Icon: PlayCircle },
  Pending: { className: "border-border bg-surface text-text-secondary", Icon: Clock },
  Waiting: { className: "border-warning/50 bg-warning/10 text-warning", Icon: Clock },
  Running: { className: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80", Icon: Loader2 },
  Processing: { className: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80", Icon: Loader2 },
  Locked: { className: "border-border bg-surface-hover text-text-muted", Icon: Lock },
  Error: { className: "border-transparent bg-danger text-white hover:bg-danger/80", Icon: AlertCircle },
  // Legacy generic variants
  default: { className: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80", Icon: null },
  secondary: { className: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80", Icon: null },
  danger: { className: "border-transparent bg-danger text-white hover:bg-danger/80", Icon: null },
  success: { className: "border-transparent bg-success text-white hover:bg-success/80", Icon: null },
  warning: { className: "border-transparent bg-warning text-white hover:bg-warning/80", Icon: null },
  info: { className: "border-transparent bg-info text-white hover:bg-info/80", Icon: null },
  outline: { className: "text-text-primary", Icon: null },
};

function Badge({ className, variant = "default", showIcon = false, children, ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const config = statusConfig[variant] || statusConfig.default;
  const Icon = config.Icon;
  const isSpinning = variant === 'Running' || variant === 'Processing';

  return (
    <div className={cn(baseStyles, config.className, className)} {...props}>
      {showIcon && Icon && (
        <Icon className={cn("w-3.5 h-3.5", isSpinning && "animate-spin")} />
      )}
      {children}
    </div>
  );
}

export { Badge };

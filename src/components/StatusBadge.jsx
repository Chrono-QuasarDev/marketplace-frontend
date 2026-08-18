import React from 'react';
import { Clock, Loader, Truck, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: Clock,
  },
  processing: {
    label: 'Processing',
    bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: Loader,
  },
  shipped: {
    label: 'Shipped',
    bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    icon: XCircle,
  },
};

export const StatusBadge = ({ status = 'pending', size = 'sm' }) => {
  const config = STATUS_CONFIG[status.toLowerCase()] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm gap-1.5' : 'px-2.5 py-0.5 text-xs gap-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${sizeClasses}`}
    >
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      <span>{config.label}</span>
    </span>
  );
};

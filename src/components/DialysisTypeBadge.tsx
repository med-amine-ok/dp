import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface DialysisTypeBadgeProps {
  type: 'HD' | 'PD';
  className?: string;
}

const DialysisTypeBadge: React.FC<DialysisTypeBadgeProps> = ({ type, className }) => {
  const config = {
    HD: {
      label: 'Hémodialyse',
      shortLabel: 'HD',
      className: 'bg-primary/20 text-primary border-primary/30',
    },
    PD: {
      label: 'Dialyse péritonéale',
      shortLabel: 'PD',
      className: 'bg-accent text-accent-foreground border-accent',
    },
  };

  const c = config[type];

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-bold border rounded-full px-3 py-1',
        c.className,
        className
      )}
    >
      {c.shortLabel}
    </Badge>
  );
};

export default DialysisTypeBadge;

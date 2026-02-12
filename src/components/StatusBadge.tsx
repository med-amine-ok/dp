import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatusBadgeProps {
  status: 'active' | 'recovering' | 'critical' | 'completed' | 'scheduled' | 'missed';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const { language } = useLanguage();

  const statusConfig = {
    active: {
      labelFr: 'Actif',
      labelAr: 'نشط',
      className: 'bg-success/20 text-success border-success/30',
    },
    recovering: {
      labelFr: 'En récupération',
      labelAr: 'في التعافي',
      className: 'bg-warning/20 text-warning border-warning/30',
    },
    critical: {
      labelFr: 'Critique',
      labelAr: 'حرج',
      className: 'bg-destructive/20 text-destructive border-destructive/30',
    },
    completed: {
      labelFr: 'Terminé',
      labelAr: 'مكتمل',
      className: 'bg-success/20 text-success border-success/30',
    },
    scheduled: {
      labelFr: 'Planifié',
      labelAr: 'مجدول',
      className: 'bg-primary/20 text-primary border-primary/30',
    },
    missed: {
      labelFr: 'Manqué',
      labelAr: 'فائت',
      className: 'bg-destructive/20 text-destructive border-destructive/30',
    },
  };

  const config = statusConfig[status];
  const label = language === 'ar' ? config.labelAr : config.labelFr;

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border rounded-full px-3 py-1',
        config.className,
        className
      )}
    >
      {label}
    </Badge>
  );
};

export default StatusBadge;

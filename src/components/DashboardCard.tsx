import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'accent';
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
  className,
}) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    accent: 'bg-accent text-accent-foreground',
  };

  return (
    <Card className={cn('overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-200 interactive-lift', className)}>
      <CardContent className="p-6 md:p-7">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            <p className="text-3xl md:text-4xl font-bold text-foreground leading-none">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                'flex items-center gap-1.5 mt-3 text-sm font-semibold',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{trend.value}%</span>
              </div>
            )}
          </div>
          <div className={cn('p-3.5 rounded-2xl shadow-[inset_0_1px_0_hsl(0_0%_100%/0.45)]', colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;

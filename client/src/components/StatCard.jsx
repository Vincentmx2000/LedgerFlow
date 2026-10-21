import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const StatCard = ({
  title,
  value,
  change,
  trend = 'neutral',
  subtitle,
  icon: Icon,
  badgeText,
}) => {
  return (
    <Card className="hover:border-border/80 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        <div className="flex items-center gap-2 mt-1.5 text-xs">
          {change && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                trend === 'up' && "text-emerald-600 dark:text-emerald-400",
                trend === 'down' && "text-rose-600 dark:text-rose-400",
                trend === 'neutral' && "text-muted-foreground"
              )}
            >
              {trend === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3" />}
              {trend === 'neutral' && <Minus className="h-3 w-3" />}
              {change}
            </span>
          )}
          {subtitle && (
            <span className="text-muted-foreground truncate">{subtitle}</span>
          )}
          {badgeText && (
            <Badge variant="secondary" className="ml-auto text-[10px] font-normal px-1.5 py-0">
              {badgeText}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

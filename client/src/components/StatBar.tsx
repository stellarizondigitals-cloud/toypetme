import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface StatBarProps {
  icon: LucideIcon;
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

export default function StatBar({ icon: Icon, label, value, maxValue, color }: StatBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const isLow = percentage < 30;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <span className="text-sm font-medium" data-testid={`text-stat-label-${label.toLowerCase()}`}>
            {label}
          </span>
        </div>
        <span 
          className={`text-sm font-semibold ${isLow ? 'text-destructive' : 'text-muted-foreground'}`}
          data-testid={`text-stat-value-${label.toLowerCase()}`}
        >
          {value}/{maxValue}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${isLow ? 'animate-pulse' : ''}`}
        data-testid={`progress-${label.toLowerCase()}`}
      />
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Utensils, Gamepad2, Sparkles, Moon } from "lucide-react";

interface ActionButtonsProps {
  onFeed: () => void;
  onPlay: () => void;
  onClean: () => void;
  onSleep: () => void;
}

export default function ActionButtons({ onFeed, onPlay, onClean, onSleep }: ActionButtonsProps) {
  const actions = [
    { 
      icon: Utensils, 
      label: "Feed", 
      onClick: onFeed, 
      variant: "default" as const,
      testId: "button-feed"
    },
    { 
      icon: Gamepad2, 
      label: "Play", 
      onClick: onPlay, 
      variant: "default" as const,
      testId: "button-play"
    },
    { 
      icon: Sparkles, 
      label: "Clean", 
      onClick: onClean, 
      variant: "default" as const,
      testId: "button-clean"
    },
    { 
      icon: Moon, 
      label: "Sleep", 
      onClick: onSleep, 
      variant: "secondary" as const,
      testId: "button-sleep"
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          size="lg"
          className="h-14 gap-2 rounded-xl active-elevate-2"
          onClick={() => {
            action.onClick();
            console.log(`${action.label} action triggered`);
          }}
          data-testid={action.testId}
        >
          <action.icon className="w-5 h-5" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}

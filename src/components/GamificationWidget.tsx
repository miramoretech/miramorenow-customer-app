import { Flame, Trophy } from "lucide-react";

interface GamificationWidgetProps {
  xp?: number;
  maxXp?: number;
  level?: string;
  streak?: number;
  cashback?: number;
}

const GamificationWidget = ({
  xp = 450,
  maxXp = 1000,
  level = "Silver",
  streak = 3,
  cashback = 250,
}: GamificationWidgetProps) => {
  const progress = (xp / maxXp) * 100;

  return (
    <div className="px-4 pt-5 space-y-3">
      {/* XP & Level */}
      <div className="bg-card rounded-2xl shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-rewards flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground font-display">{level} Level</p>
              <p className="text-[10px] text-muted-foreground">{xp.toLocaleString()} / {maxXp.toLocaleString()} XP to Gold</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-conversion/10 px-2.5 py-1 rounded-full animate-streak-glow">
            <Flame className="w-3.5 h-3.5 text-conversion" />
            <span className="text-xs font-bold text-conversion">{streak}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-rewards rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Missions preview */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { task: "Order food today", xp: 50, emoji: "🍽️", done: false },
          { task: "Book a beauty service", xp: 75, emoji: "💇‍♀️", done: false },
          { task: "Daily login bonus", xp: 10, emoji: "🎁", done: true },
        ].map((mission) => (
          <div
            key={mission.task}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium press-scale ${
              mission.done
                ? "bg-primary/5 border-primary/20 text-primary"
                : "bg-card border-border text-foreground"
            }`}
          >
            <span>{mission.emoji}</span>
            <span className="whitespace-nowrap">{mission.task}</span>
            <span className="text-[10px] text-muted-foreground">+{mission.xp}XP</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamificationWidget;

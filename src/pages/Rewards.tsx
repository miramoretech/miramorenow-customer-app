import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

import { Trophy, Flame, Target, Gift, Star } from "lucide-react";
import { motion } from "framer-motion";

const missions = [
  { task: "Order food today", xp: 50, emoji: "🍽️", done: false },
  { task: "Book a beauty service", xp: 75, emoji: "💇‍♀️", done: false },
  { task: "Daily login bonus", xp: 10, emoji: "🎁", done: true },
  { task: "Refer a friend", xp: 200, emoji: "👫", done: false },
  { task: "Leave a review", xp: 25, emoji: "⭐", done: false },
];

const Rewards = () => {
  const xp = 450;
  const maxXp = 1000;
  const progress = (xp / maxXp) * 100;

  return (
    <motion.div
      className="min-h-screen bg-background pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <header className="sticky top-0 z-30 gradient-wallet text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-lg">Rewards</h1>
          <div className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">3 Day Streak</span>
          </div>
        </div>
      </header>

      {/* Level card */}
      <div className="p-4">
        <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl gradient-rewards flex items-center justify-center shadow-glow-secondary">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">Silver Level</p>
              <p className="text-xs text-muted-foreground">{xp.toLocaleString()} / {maxXp.toLocaleString()} XP to Gold</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full gradient-rewards rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Silver</span>
              <span>Gold</span>
              <span>Elite</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 grid grid-cols-3 gap-2">
        {[
          { icon: Star, label: "Total XP", value: "450", color: "text-secondary" },
          { icon: Flame, label: "Streak", value: "3 days", color: "text-conversion" },
          { icon: Gift, label: "Cashback", value: "₦250", color: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl shadow-card p-3 text-center press-scale">
            <stat.icon className={`w-5 h-5 mx-auto ${stat.color}`} />
            <p className="text-sm font-bold text-foreground mt-1">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Missions */}
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Daily Missions</h3>
        </div>
        <div className="space-y-2">
          {missions.map((mission, i) => (
            <motion.div
              key={mission.task}
              className={`flex items-center gap-3 p-4 rounded-2xl border shadow-card press-scale min-h-[56px] ${
                mission.done
                  ? "bg-primary/5 border-primary/20"
                  : "bg-card border-border"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <span className="text-2xl">{mission.emoji}</span>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${mission.done ? "text-primary line-through" : "text-foreground"}`}>
                  {mission.task}
                </p>
                <p className="text-[10px] text-muted-foreground">+{mission.xp} XP</p>
              </div>
              {mission.done && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Done ✓</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <WhatsAppButton />

      <BottomNav />
    </motion.div>
  );
};

export default Rewards;

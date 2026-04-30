import { useState } from "react";
import { ArrowLeft, Copy, Share2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

const InviteFriend = () => {
  const navigate = useNavigate();
  const [coins] = useState(0);
  const referralCode = "MR.WILLIAMS_4821";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join MiramoreNow!",
        text: `Use my referral code ${referralCode} to join MiramoreNow and earn 100 MiramoreCoins! Download now.`,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with emotional image */}
      <div className="relative h-56 bg-destructive overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-destructive/80 to-destructive/95" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
          <span className="text-6xl mb-3">🤝</span>
          <p className="text-primary-foreground text-sm italic font-medium leading-relaxed max-w-xs">
            "The best kind of giving… is putting someone on."
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 p-2 rounded-full bg-card/20 backdrop-blur-sm text-primary-foreground press-scale"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 -mt-6 relative z-10 space-y-4">
        {/* Main card */}
        <div className="bg-card rounded-2xl shadow-card p-5 space-y-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground font-display">Invite Friends & Earn</h1>
              <p className="text-xs text-muted-foreground">Share the love, get rewarded</p>
            </div>
          </div>

          <p className="text-sm text-foreground leading-relaxed">
            Refer friends & family. Earn <span className="font-bold text-primary">100 MiramoreCoins</span> when they join and place an order.
          </p>

          {/* Earnings tracker */}
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total MiramoreCoins Earned</p>
            <p className="text-3xl font-bold text-primary font-display">{coins}</p>
          </div>
        </div>

        {/* Referral code */}
        <div className="bg-card rounded-2xl shadow-card p-5 space-y-3 border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Referral Code</p>
          <div className="flex items-center gap-2 bg-muted rounded-xl p-3">
            <span className="flex-1 text-base font-bold text-foreground font-display tracking-wider">
              {referralCode}
            </span>
            <button onClick={handleCopy} className="p-2 rounded-lg bg-primary/10 text-primary press-scale">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            className="w-full h-12 rounded-2xl border-primary text-primary font-bold press-scale"
          >
            <Copy className="w-4 h-4 mr-2" /> Copy Code
          </Button>
          <Button
            onClick={handleShare}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base press-scale shadow-md"
          >
            <Share2 className="w-5 h-5 mr-2" /> Refer a Friend
          </Button>
        </div>

        {/* Quote */}
        <p className="text-xs text-muted-foreground/50 italic text-center pt-2 pb-4">
          "The more you share, the more you earn." 💛
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default InviteFriend;

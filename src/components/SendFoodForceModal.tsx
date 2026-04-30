import { useState } from "react";
import { X, Heart, Users, Zap, Gift, MapPin, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SendFoodForceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SendToOneTab = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="space-y-4 py-4"
  >
    <div className="text-center space-y-2">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <Heart className="w-8 h-8 text-primary" />
      </div>
      <h3 className="font-bold text-foreground font-display">Send to a Loved One</h3>
      <p className="text-sm text-muted-foreground">
        Pick a friend, family member, or colleague and surprise them with a meal 💛
      </p>
    </div>

    <div className="space-y-3">
      <input
        type="tel"
        placeholder="Enter recipient's phone number"
        className="w-full px-4 py-3 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <select className="w-full px-4 py-3 rounded-2xl bg-muted/60 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
        <option value="">Relationship</option>
        <option value="friend">👫 Friend</option>
        <option value="family">👨‍👩‍👧 Family</option>
        <option value="colleague">💼 Colleague</option>
      </select>
    </div>

    <div className="space-y-2">
      <p className="text-xs font-bold text-foreground">What's the occasion?</p>
      <div className="flex flex-wrap gap-2">
        {["🎂 Birthday", "🙏 Apology", "💛 Just Because", "😤 Hangry Friend"].map((chip) => (
          <button
            key={chip}
            className="px-3 py-1.5 rounded-full bg-secondary/15 text-xs font-semibold text-foreground border border-secondary/30 hover:bg-primary hover:text-primary-foreground transition-all press-scale"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>

    <button className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm press-scale hover:bg-primary/90 transition-colors shadow-md">
      Continue to Menu →
    </button>
  </motion.div>
);

const GroupSendTab = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="space-y-4 py-4"
  >
    <div className="text-center space-y-2">
      <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
        <Users className="w-8 h-8 text-accent-foreground" />
      </div>
      <h3 className="font-bold text-foreground font-display">Group Feed 🍕</h3>
      <p className="text-sm text-muted-foreground">
        Create a shared cart link. Anyone with the link can add items — you pay delivery, they split food!
      </p>
    </div>

    <div className="bg-muted/40 rounded-2xl p-4 border border-border space-y-3">
      <input
        type="text"
        placeholder="Group name (e.g., 'Office Lunch')"
        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="w-3.5 h-3.5" />
        <span>Delivery to your current location</span>
      </div>
    </div>

    <button className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm press-scale hover:bg-primary/90 transition-colors shadow-md">
      Create Group Link 🔗
    </button>

    <p className="text-[10px] text-center text-muted-foreground">
      You'll get a link to share via WhatsApp, Instagram, or text
    </p>
  </motion.div>
);

const ForceDealsTab = () => {
  const deals = [
    { name: "Office Fuel Pack", emoji: "☕", desc: "Shawarma + Chapman + Chin Chin", price: "₦6,500" },
    { name: "Date Night Duo", emoji: "🌹", desc: "2× Jollof Rice + Grilled Chicken + Wine", price: "₦12,000" },
    { name: "Apology Package", emoji: "🙏", desc: "Suya + Chapman + Ice Cream", price: "₦8,000" },
    { name: "Birthday Blast", emoji: "🎂", desc: "Cake + Small Chops + Drinks", price: "₦15,000" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 py-4"
    >
      <div className="text-center space-y-1">
        <h3 className="font-bold text-foreground font-display flex items-center justify-center gap-1.5">
          <Zap className="w-4 h-4 text-primary" /> Force Deals
        </h3>
        <p className="text-xs text-muted-foreground">Pre-selected bundles ready to gift instantly</p>
      </div>

      <div className="space-y-3">
        {deals.map((deal) => (
          <div
            key={deal.name}
            className="flex items-center gap-3 bg-card rounded-2xl border border-border p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
              {deal.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-foreground truncate">{deal.name}</h4>
              <p className="text-[10px] text-muted-foreground truncate">{deal.desc}</p>
              <span className="price-amount text-sm font-bold">{deal.price}</span>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold press-scale hover:bg-primary/90 transition-colors shrink-0">
              Send
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const SendFoodForceModal = ({ open, onOpenChange }: SendFoodForceModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto rounded-3xl border-0 p-0 z-[100] bg-background shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          className="p-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <DialogTitle className="text-lg font-bold font-display text-foreground">
                Send Force 🔥
              </DialogTitle>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="send-to-one" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-muted/60 rounded-2xl p-1 h-auto">
              <TabsTrigger
                value="send-to-one"
                className="rounded-xl text-[11px] font-bold py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <Heart className="w-3 h-3 mr-1" />
                Send to One
              </TabsTrigger>
              <TabsTrigger
                value="group-send"
                className="rounded-xl text-[11px] font-bold py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <Users className="w-3 h-3 mr-1" />
                Group Send
              </TabsTrigger>
              <TabsTrigger
                value="force-deals"
                className="rounded-xl text-[11px] font-bold py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <Zap className="w-3 h-3 mr-1" />
                Force Deals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="send-to-one">
              <SendToOneTab />
            </TabsContent>
            <TabsContent value="group-send">
              <GroupSendTab />
            </TabsContent>
            <TabsContent value="force-deals">
              <ForceDealsTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default SendFoodForceModal;

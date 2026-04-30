import { useState } from "react";
import { Gift, Heart, Users, Zap, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import SendGoodLifeTab from "./softlife/SendGoodLifeTab";
import GroupFeedTab from "./softlife/GroupFeedTab";
import SoftLifeBundlesTab from "./softlife/SoftLifeBundlesTab";
import type { GiftCartItem } from "./softlife/types";

interface ShareSoftLifeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShareSoftLifeModal = ({ open, onOpenChange }: ShareSoftLifeModalProps) => {
  const [activeTab, setActiveTab] = useState("send-good-life");
  const [prefilledItems, setPrefilledItems] = useState<GiftCartItem[]>([]);

  const handleBundleSelect = (items: GiftCartItem[]) => {
    setPrefilledItems(items);
    setActiveTab("send-good-life");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border-0 p-0 z-[100] bg-background shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          className="p-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <DialogTitle className="text-lg font-bold font-display text-foreground">
                Share Soft Life ✨
              </DialogTitle>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground mb-4 italic">
            "Good food, good life, delivered smarter"
          </p>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-muted/60 rounded-2xl p-1 h-auto">
              <TabsTrigger
                value="send-good-life"
                className="rounded-xl text-[10px] font-bold py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <Heart className="w-3 h-3 mr-1" />
                Send Good Life
              </TabsTrigger>
              <TabsTrigger
                value="group-feed"
                className="rounded-xl text-[10px] font-bold py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <Users className="w-3 h-3 mr-1" />
                Group Feed
              </TabsTrigger>
              <TabsTrigger
                value="bundles"
                className="rounded-xl text-[10px] font-bold py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <Zap className="w-3 h-3 mr-1" />
                Bundles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="send-good-life">
              <SendGoodLifeTab
                prefilledItems={prefilledItems.length > 0 ? prefilledItems : undefined}
                onClose={() => onOpenChange(false)}
              />
            </TabsContent>
            <TabsContent value="group-feed">
              <GroupFeedTab />
            </TabsContent>
            <TabsContent value="bundles">
              <SoftLifeBundlesTab onSelectBundle={handleBundleSelect} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareSoftLifeModal;

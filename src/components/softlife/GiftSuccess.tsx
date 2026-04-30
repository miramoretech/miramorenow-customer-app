import { Gift, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import type { GiftRecipient } from "./types";

interface Props {
  recipient: GiftRecipient;
  onClose: () => void;
}

const GiftSuccess = ({ recipient, onClose }: Props) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
    className="text-center space-y-4 py-4"
  >
    <motion.div
      animate={{ rotateY: [0, 360] }}
      transition={{ duration: 1, delay: 0.3 }}
      className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
    >
      <Gift className="w-10 h-10 text-primary" />
    </motion.div>

    <div className="space-y-1">
      <h3 className="text-lg font-bold text-foreground font-display">Soft Life Sent! 🎉</h3>
      <p className="text-sm text-muted-foreground">
        {recipient.name || "Your recipient"} will receive a notification to open their gift
      </p>
    </div>

    <div className="bg-primary/5 rounded-2xl p-3 border border-primary/20 text-xs text-muted-foreground">
      💡 They'll get a 50% discount to <strong className="text-foreground">Send Soft Life Back</strong> within 24 hours!
    </div>

    <div className="flex gap-2">
      <button
        onClick={() => {
          navigator.share?.({ title: "I just sent Soft Life!", text: "Good food, good life — delivered smarter 💛", url: "https://miramorenow.lovable.app" }).catch(() => {});
        }}
        className="flex-1 py-2.5 rounded-2xl bg-muted text-foreground font-bold text-sm press-scale flex items-center justify-center gap-1.5"
      >
        <Share2 className="w-4 h-4" /> Share Moment
      </button>
      <button
        onClick={onClose}
        className="flex-1 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm press-scale"
      >
        Done ✨
      </button>
    </div>
  </motion.div>
);

export default GiftSuccess;

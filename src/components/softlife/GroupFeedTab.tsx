import { useState } from "react";
import { Users, MapPin, Copy, Check, Link2 } from "lucide-react";
import { motion } from "framer-motion";

const GroupFeedTab = () => {
  const [groupName, setGroupName] = useState("");
  const [linkCreated, setLinkCreated] = useState(false);
  const [copied, setCopied] = useState(false);

  const groupId = Math.random().toString(36).slice(2, 8);
  const shareLink = `https://miramorenow.lovable.app/group/${groupId}`;

  const handleCreate = () => {
    if (groupName.trim()) setLinkCreated(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 py-3"
    >
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
          <Users className="w-7 h-7 text-accent-foreground" />
        </div>
        <h3 className="font-bold text-foreground font-display">Group Feed 🍕</h3>
        <p className="text-xs text-muted-foreground">
          Create a shared cart. Friends add items, you handle delivery — everyone eats!
        </p>
      </div>

      {!linkCreated ? (
        <div className="space-y-3">
          <div className="bg-muted/40 rounded-2xl p-4 border border-border space-y-3">
            <input
              type="text"
              placeholder="Group name (e.g., 'Office Friday')"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>Delivery to your current location</span>
            </div>
          </div>

          <button
            disabled={!groupName.trim()}
            onClick={handleCreate}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm press-scale hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
          >
            Create Group Link 🔗
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-3"
        >
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">{groupName}</span>
            </div>
            <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2">
              <span className="text-[10px] text-muted-foreground flex-1 truncate">{shareLink}</span>
              <button onClick={copyLink} className="p-1.5 rounded-lg bg-primary text-primary-foreground press-scale">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Join my food group "${groupName}" on Miramore! ${shareLink}`)}`, "_blank")}
              className="py-2.5 rounded-2xl bg-[hsl(142,70%,40%)] text-white font-bold text-xs press-scale"
            >
              Share via WhatsApp
            </button>
            <button
              onClick={copyLink}
              className="py-2.5 rounded-2xl bg-muted text-foreground font-bold text-xs press-scale"
            >
              Copy Link
            </button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground">
            Anyone with the link can add items. You'll pay delivery when you close the group.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GroupFeedTab;

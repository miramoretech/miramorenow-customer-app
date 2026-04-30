import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const contacts = [
  { label: "Line 1", number: "+2349059158018" },
  { label: "Line 2", number: "+2347037632867" },
];

const WhatsAppButton = () => {
  const [open, setOpen] = useState(false);

  const handleChat = (number: string) => {
    const msg = encodeURIComponent("Hi Miramorenow! I'd like to place an order.");
    window.open(`https://wa.me/${number.replace("+", "")}?text=${msg}`, "_blank");
    setOpen(false);
  };

  return (
    <div className="fixed bottom-24 left-4 z-40 flex flex-col items-start gap-2">
      {open && (
        <div className="bg-card rounded-2xl shadow-lg border border-border p-3 space-y-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          {contacts.map((c) => (
            <button
              key={c.number}
              onClick={() => handleChat(c.number)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-muted transition-colors text-sm font-medium text-foreground active:scale-[0.97]"
            >
              <span className="text-lg">📱</span>
              <span>{c.label}: {c.number}</span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95",
          open
            ? "bg-muted text-foreground"
            : "bg-[#25D366] text-white"
        )}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default WhatsAppButton;

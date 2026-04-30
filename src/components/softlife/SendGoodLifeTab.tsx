import { useState } from "react";
import { Heart, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { GiftRecipient, GiftCartItem, SoftLifeStep } from "./types";
import RecipientForm from "./RecipientForm";
import GiftMenuSelection from "./GiftMenuSelection";
import VoiceNoteRecorder from "./VoiceNoteRecorder";
import GiftPayment from "./GiftPayment";
import GiftSuccess from "./GiftSuccess";

interface Props {
  prefilledItems?: GiftCartItem[];
  onClose: () => void;
}

const SendGoodLifeTab = ({ prefilledItems, onClose }: Props) => {
  const [step, setStep] = useState<SoftLifeStep>(prefilledItems?.length ? "menu" : "form");
  const [recipient, setRecipient] = useState<GiftRecipient>({ name: "", phone: "", relationship: "", occasion: "" });
  const [giftCart, setGiftCart] = useState<GiftCartItem[]>(prefilledItems || []);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);

  const stepLabels: Record<SoftLifeStep, string> = {
    form: "Recipient",
    menu: "Choose Items",
    voice: "Voice Note",
    payment: "Payment",
    success: "Sent!",
  };

  const canGoBack = step !== "form" && step !== "success";

  const goBack = () => {
    const order: SoftLifeStep[] = ["form", "menu", "voice", "payment"];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  };

  return (
    <div className="space-y-3 py-3">
      {/* Step indicator */}
      <div className="flex items-center gap-2 px-1">
        {canGoBack && (
          <button onClick={goBack} className="p-1 rounded-lg hover:bg-muted press-scale">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        <div className="flex gap-1.5 flex-1">
          {(["form", "menu", "voice", "payment"] as SoftLifeStep[]).map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${step === s || (["form","menu","voice","payment"].indexOf(s) < ["form","menu","voice","payment"].indexOf(step)) ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <span className="text-[10px] font-bold text-muted-foreground">{stepLabels[step]}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === "form" && (
            <RecipientForm
              recipient={recipient}
              onChange={setRecipient}
              onContinue={() => setStep("menu")}
            />
          )}
          {step === "menu" && (
            <GiftMenuSelection
              recipient={recipient}
              giftCart={giftCart}
              setGiftCart={setGiftCart}
              onContinue={() => setStep("voice")}
            />
          )}
          {step === "voice" && (
            <VoiceNoteRecorder
              voiceBlob={voiceBlob}
              setVoiceBlob={setVoiceBlob}
              onContinue={() => setStep("payment")}
              onSkip={() => setStep("payment")}
            />
          )}
          {step === "payment" && (
            <GiftPayment
              giftCart={giftCart}
              recipient={recipient}
              onSuccess={() => setStep("success")}
            />
          )}
          {step === "success" && (
            <GiftSuccess recipient={recipient} onClose={onClose} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SendGoodLifeTab;

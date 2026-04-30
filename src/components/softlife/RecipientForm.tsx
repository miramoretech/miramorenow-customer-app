import { Heart } from "lucide-react";
import type { GiftRecipient } from "./types";

interface Props {
  recipient: GiftRecipient;
  onChange: (r: GiftRecipient) => void;
  onContinue: () => void;
}

const occasions = ["🎂 Birthday", "🙏 Apology", "💛 Just Because", "😤 Hangry Friend", "🎉 Celebration"];

const RecipientForm = ({ recipient, onChange, onContinue }: Props) => {
  const update = (field: keyof GiftRecipient, value: string) =>
    onChange({ ...recipient, [field]: value });

  const isValid = recipient.phone.length >= 10 && recipient.occasion;

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Heart className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-bold text-foreground font-display">Send Good Life</h3>
        <p className="text-xs text-muted-foreground">Surprise someone with a meal 💛</p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Recipient's name (optional)"
          value={recipient.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <input
          type="tel"
          placeholder="Recipient's phone number *"
          value={recipient.phone}
          onChange={(e) => update("phone", e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <select
          value={recipient.relationship}
          onChange={(e) => update("relationship", e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-muted/60 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
        >
          <option value="">Relationship</option>
          <option value="friend">👫 Friend</option>
          <option value="family">👨‍👩‍👧 Family</option>
          <option value="colleague">💼 Colleague</option>
          <option value="partner">❤️ Partner</option>
        </select>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-foreground">What's the occasion? *</p>
        <div className="flex flex-wrap gap-2">
          {occasions.map((chip) => (
            <button
              key={chip}
              onClick={() => update("occasion", chip)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all press-scale ${
                recipient.occasion === chip
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-secondary/15 text-foreground border-secondary/30 hover:bg-primary/10"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <button
        disabled={!isValid}
        onClick={onContinue}
        className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm press-scale hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue to Menu →
      </button>
    </div>
  );
};

export default RecipientForm;

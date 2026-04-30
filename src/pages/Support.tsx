import { ArrowLeft, Bike, Store, Info, Shield, ChevronRight, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";

type Section = null | "deliver" | "sell" | "about" | "privacy" | "terms";

const Support = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>(null);

  const sections = [
    { id: "deliver" as const, icon: Bike, label: "Deliver on MiramoreNow", emoji: "🚴" },
    { id: "sell" as const, icon: Store, label: "Sell on MiramoreNow", emoji: "🍔" },
    { id: "about" as const, icon: Info, label: "About MiramoreNow", emoji: "💡" },
    { id: "privacy" as const, icon: Shield, label: "Privacy Policy", emoji: "🔒" },
    { id: "terms" as const, icon: Shield, label: "Terms of Service", emoji: "📜" },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "deliver":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground font-display">🚴 Deliver on MiramoreNow</h2>
            <p className="text-sm text-muted-foreground">Start earning as a delivery partner in 3 simple steps:</p>
            <div className="space-y-3">
              {["Sign up on the platform", "Submit your details for verification", "Get approved & start earning"].map((step, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{i + 1}</div>
                  <span className="text-sm text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case "sell":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground font-display">🍔 Sell on MiramoreNow</h2>
            <p className="text-sm text-muted-foreground">Get your business in front of thousands of customers:</p>
            <div className="space-y-3">
              {["Register your business", "Upload your menu or catalog", "Get onboarded & start selling"].map((step, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{i + 1}</div>
                  <span className="text-sm text-foreground">{step}</span>
                </div>
              ))}
            </div>
            <a
              href="https://wa.me/2348000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm press-scale shadow-md"
            >
              <MessageCircle className="w-4 h-4" /> Quick Onboarding via WhatsApp
            </a>
          </div>
        );
      case "about":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground font-display">💡 About MiramoreNow</h2>
            <p className="text-sm text-foreground leading-relaxed">
              MiramoreNow is a smart lifestyle platform that connects you to food, beauty, and everyday needs — while rewarding you every step of the way.
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              We believe life should feel soft, simple, and enjoyable. That's why we've built a system that not only delivers what you want, but also gives back to you through rewards, convenience, and thoughtful experiences.
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              MiramoreNow is proudly owned and managed by <strong>Miramore Consulting Limited</strong>.
            </p>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-semibold mb-1">📍 Our Location</p>
              <p className="text-sm text-foreground">Suite C30, Platinum Mall, Opposite Vento Furniture, Ikota-Lekki, Lagos State, Nigeria.</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-foreground"><strong>🌍 Mission:</strong> To empower everyday life by connecting people with food, services, and opportunities in a simple, reliable, and rewarding way.</p>
              <p className="text-sm text-foreground"><strong>🚀 Vision:</strong> To become Africa's most loved lifestyle platform — where convenience meets care.</p>
            </div>
          </div>
        );
      case "privacy":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground font-display">🔒 Privacy Policy</h2>
            <p className="text-sm text-muted-foreground">Your privacy matters to us.</p>
            {[
              { title: "Information We Collect", content: "We may collect your name, phone number, email, delivery address, payment details (secured and encrypted), and app usage data." },
              { title: "How We Use Your Information", content: "We use your data to process orders, improve services, send updates, and personalize offers and rewards." },
              { title: "Data Protection", content: "Your data is stored securely. Payments are encrypted. We do not sell your personal information to third parties." },
              { title: "Sharing of Information", content: "We only share necessary information with vendors (to fulfill orders) and riders (for delivery)." },
              { title: "Your Rights", content: "You have the right to access your data, request corrections, and request deletion of your account." },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">{i + 1}. {item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        );
      case "terms":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground font-display">📜 Terms of Service</h2>
            <p className="text-sm text-muted-foreground">By using MiramoreNow, you agree to the following:</p>
            {[
              { title: "Use of the Platform", content: "MiramoreNow provides access to food delivery, marketplace items, and beauty services. You agree to use the platform responsibly." },
              { title: "Orders & Payments", content: "All orders must be paid through approved methods. Prices are set by vendors and may change." },
              { title: "Deliveries", content: "Delivery times are estimates and may vary. Riders are independent partners." },
              { title: "Wallet & Rewards", content: "Rewards (e.g., MiramoreCoins) are non-transferable. Coins may have expiry conditions. Abuse may lead to suspension." },
              { title: "User Responsibilities", content: "You agree not to provide false information, abuse vendors or riders, or use the platform for fraud." },
              { title: "Contact & Support", content: "For help, visit the Support Center in the app or reach us via our official channels." },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">{i + 1}. {item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => activeSection ? setActiveSection(null) : navigate(-1)}
          className="p-1 press-scale"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-bold text-lg text-foreground font-display">Support Center</h1>
      </header>

      {/* Background quote */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-xs text-muted-foreground/40 italic text-center">
          "We're here for you, always." 🤍
        </p>
      </div>

      <div className="p-4">
        {activeSection ? (
          <div className="bg-card rounded-2xl border border-border p-5 shadow-card animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
            {renderSection()}
          </div>
        ) : (
          <div className="space-y-2">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className="flex items-center justify-between w-full bg-card rounded-xl border border-border p-4 shadow-card press-scale hover-lift"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{s.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{s.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Support;

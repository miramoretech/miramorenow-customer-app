import { X, Wallet, Heart, Gift, User, Users, Settings, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MiramoreLogo from "@/components/MiramoreLogo";

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Wallet, label: "Wallet", path: "/wallet" },
  { icon: Heart, label: "Favourites", path: "/home" },
  { icon: Gift, label: "Gift a Meal", path: "/home" },
  { icon: User, label: "Profile", path: "/profile" },
  
  { icon: Users, label: "Invite a Friend", path: "/invite" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: HelpCircle, label: "Support Center", path: "/support" },
];

const SideMenu = ({ open, onClose }: SideMenuProps) => {
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={onClose}
        />
      )}
      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-card z-50 shadow-xl transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MiramoreLogo size="sm" />
            <span className="font-bold text-foreground font-display text-sm">MiramoreNow</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted press-scale">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNav(item.path)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-muted/60 transition-colors press-scale text-left"
            >
              <item.icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Bottom quote */}
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <p className="text-[11px] text-muted-foreground/60 italic text-center">
            "Good food. Good life. Delivered smarter."
          </p>
        </div>
      </div>
    </>
  );
};

export default SideMenu;

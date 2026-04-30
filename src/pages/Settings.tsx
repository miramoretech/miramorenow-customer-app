import { ArrowLeft, Lock, Users, LogOut, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";


const Settings = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/welcome");
  };

  return (
    <motion.div
      className="min-h-screen bg-background pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2.5 press-scale min-w-[48px] min-h-[48px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-bold text-lg text-foreground">Settings</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">⚙️ Account</h3>

          <button
            onClick={() => toast.info("Password change coming soon!")}
            className="flex items-center justify-between w-full bg-card rounded-2xl border border-border p-4 shadow-card press-scale min-h-[56px]"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Change Password</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => navigate("/invite")}
            className="flex items-center justify-between w-full bg-card rounded-2xl border border-border p-4 shadow-card press-scale min-h-[56px]"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Invite a Friend</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full bg-card rounded-2xl border border-border p-4 shadow-card press-scale mt-4 min-h-[56px]"
          >
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">Logout</span>
          </button>
        </div>
      </div>


      <BottomNav />
    </motion.div>
  );
};

export default Settings;

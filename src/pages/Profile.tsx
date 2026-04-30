import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { User, LogOut, Settings, Shield, Moon, HelpCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import WhatsAppButton from '@/components/WhatsAppButton';
import MiraAssistant from '@/components/MiraAssistant';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
        });
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/welcome');
  };

  const menuItems = [
    { icon: Shield, label: 'Privacy & Security', action: () => navigate('/support') },
    { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
    { icon: Moon, label: 'Low Data Mode', action: () => toast.info('Low data mode coming soon!') },
    { icon: HelpCircle, label: 'Support Center', action: () => navigate('/support') },
    { icon: LogOut, label: 'Sign Out', action: handleLogout, destructive: true },
  ];

  return (
    <motion.div
      className="min-h-screen bg-background pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-4">
        <h1 className="font-bold text-lg text-foreground">Profile</h1>
      </header>

      <div className="px-4 pt-3 pb-1">
        <p className="text-xs text-muted-foreground/40 italic text-center">"This is your space." ✨</p>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3 bg-card rounded-2xl border border-border p-4 shadow-card">
          <div className="w-14 h-14 rounded-full gradient-wallet flex items-center justify-center shadow-glow-primary">
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground">{user?.name || 'Guest User'}</p>
            <p className="text-xs text-muted-foreground">{user?.email || 'Sign in to access all features'}</p>
          </div>
          {!user && (
            <button onClick={() => navigate('/welcome')} className="text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-full press-scale min-h-[48px] flex items-center">
              Sign In
            </button>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 shadow-card space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-rewards flex items-center justify-center">
              <span className="text-white font-bold text-sm">🎁</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Starter Perks</p>
              <p className="text-[10px] text-muted-foreground">Welcome rewards for you</p>
            </div>
            <button onClick={() => navigate('/rewards')} className="text-xs font-bold text-primary press-scale min-h-[48px] flex items-center px-2">View →</button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-foreground"><span className="text-primary">✓</span> ₦500 off your first order</div>
            <div className="flex items-center gap-2 text-xs text-foreground"><span className="text-primary">✓</span> 2 free deliveries after first 2 orders</div>
            <div className="flex items-center gap-2 text-xs text-foreground"><span className="text-primary">✓</span> Earn 20 credits for every ₦200 spent</div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-card rounded-2xl border border-border p-4 shadow-card">
          <div className="w-10 h-10 rounded-xl gradient-rewards flex items-center justify-center">
            <span className="text-white font-bold text-sm">🏆</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Silver Level</p>
            <p className="text-[10px] text-muted-foreground">450 / 1000 XP to Gold</p>
          </div>
          <button onClick={() => navigate('/rewards')} className="text-xs font-bold text-primary press-scale min-h-[48px] flex items-center px-2">View →</button>
        </div>

        <div className="space-y-2 pt-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`flex items-center gap-3 w-full bg-card rounded-2xl border border-border p-4 hover-lift press-scale min-h-[56px] ${item.destructive ? 'text-destructive' : ''}`}
            >
              <item.icon className={`w-5 h-5 ${item.destructive ? 'text-destructive' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium flex-1 text-left ${item.destructive ? 'text-destructive' : 'text-foreground'}`}>{item.label}</span>
              {!item.destructive && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </button>
          ))}
        </div>
      </div>

      <WhatsAppButton />

      <BottomNav />
    </motion.div>
  );
};

export default Profile;

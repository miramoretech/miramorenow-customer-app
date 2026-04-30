import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MiramoreLogo from "@/components/MiramoreLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/home");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      
      if (error) {
        if (error.message === "Invalid login credentials") {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(error.message);
        }
      } else {
        // Ensure customer record exists
        if (authData.user) {
          const meta = authData.user.user_metadata;
          const { error: upsertError } = await supabase.from("customers").upsert({
            id: authData.user.id,
            email: email.trim(),
            name: meta?.full_name || email.split("@")[0],
            phone: meta?.phone || null,
            updated_at: new Date().toISOString(),
          }, { onConflict: "id" });
          
          if (upsertError) {
            console.error("Customer upsert error:", upsertError);
          }
          
          // Also save to localStorage for quick access
          localStorage.setItem("user_id", authData.user.id);
          localStorage.setItem("user_email", email.trim());
        }
        
        toast.success("Welcome back!");
        setRedirecting(true);
        
        // Small delay for better UX
        setTimeout(() => {
          navigate("/home");
        }, 500);
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Logging you in...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Back button */}
      <button
        onClick={() => navigate("/welcome")}
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>

      <div className="flex-1 overflow-auto">
        <div className="bg-primary pt-12 pb-8 px-6 flex flex-col items-center gap-3">
          <MiramoreLogo size="md" />
          <h1 className="text-primary-foreground text-2xl font-bold">Welcome back</h1>
          <p className="text-primary-foreground/70 text-sm">Log in to your account</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="h-12 rounded-xl"
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Enter password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="h-12 rounded-xl"
              autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <Button 
            onClick={handleLogin} 
            disabled={loading} 
            className="w-full h-13 text-base font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 active:scale-[0.97] rounded-2xl"
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button 
              onClick={() => navigate("/onboarding/phone-login")} 
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
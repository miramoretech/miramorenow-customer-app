import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Settings } from "lucide-react";
import { toast } from "sonner";

const settingsMeta = [
  { key: "default_delivery_fee", label: "Default Delivery Fee (₦)", type: "number" },
  { key: "commission_rate", label: "Commission Rate (%)", type: "number" },
  { key: "rider_payout_rate", label: "Rider Payout Rate (%)", type: "number" },
  { key: "min_order_amount", label: "Minimum Order Amount (₦)", type: "number" },
];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from("admin_settings").select("*");
    const map: Record<string, string> = {};
    (data || []).forEach((s: any) => { map[s.key] = s.value; });
    setSettings(map);
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from("admin_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key);
    }
    toast.success("Settings saved");
    setSaving(false);
  };

  if (loading) return <div className="space-y-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <Card className="border-0 shadow-sm max-w-lg">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Settings className="w-4 h-4" /> Platform Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settingsMeta.map(s => (
            <div key={s.key} className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{s.label}</label>
              <Input
                type={s.type}
                value={settings[s.key] || ""}
                onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })}
              />
            </div>
          ))}
          <Button onClick={saveSettings} disabled={saving} className="w-full bg-amber-500 hover:bg-amber-600">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;

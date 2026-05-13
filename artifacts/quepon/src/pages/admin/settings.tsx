import { useState, useEffect } from "react";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { Settings, Save, Moon, Sun, Loader2 } from "lucide-react";

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateMutation = useUpdateSettings();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    shopName: "GGX Gaming Center",
    standardRatePerHour: 25,
    premiumRatePerHour: 35,
    vipRatePerHour: 50,
    overnightRate: 99,
    studentDiscount: 20,
    openTime: "08:00",
    closeTime: "02:00",
    maxSessionHours: 12,
    allowAnonymousFeedback: true,
    maintenanceMode: false,
  });

  useEffect(() => {
    if (settings) setForm({ ...form, ...settings });
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate({ data: form as any }, {
      onSuccess: () => toast({ title: "Settings saved successfully" }),
      onError: () => toast({ title: "Failed to save settings", variant: "destructive" }),
    });
  };

  if (isLoading) {
    return (
      <AdminLayout breadcrumbs={[{ label: "Settings" }]}>
        <div className="flex justify-center py-40"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout breadcrumbs={[{ label: "Settings" }]}>
      <div className="space-y-8 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display flex items-center gap-3 text-foreground">
              <Settings className="w-8 h-8 text-primary" /> Settings
            </h1>
            <p className="text-muted-foreground">Configure shop parameters</p>
          </div>
          <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/80 h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]">
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save All
          </Button>
        </div>

        {/* Shop Info */}
        <Card className="bg-card border-border shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border py-4"><CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Shop Information</CardTitle></CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Shop Brand Identity</label>
              <Input value={form.shopName} onChange={e => setForm({ ...form, shopName: e.target.value })} className="bg-muted/50 border-border h-12 rounded-xl px-4 font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Activation Time</label>
                <Input type="time" value={form.openTime} onChange={e => setForm({ ...form, openTime: e.target.value })} className="bg-muted/50 border-border h-12 rounded-xl px-4 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Deactivation Time</label>
                <Input type="time" value={form.closeTime} onChange={e => setForm({ ...form, closeTime: e.target.value })} className="bg-muted/50 border-border h-12 rounded-xl px-4 font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Maximum Session Duration (Hours)</label>
              <Input type="number" value={form.maxSessionHours} onChange={e => setForm({ ...form, maxSessionHours: +e.target.value })} className="bg-muted/50 border-border h-12 rounded-xl px-4 font-bold" />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="bg-card border-border shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border py-4"><CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Pricing Matrix (PHP/HOUR)</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-6">
            {[
              { key: "standardRatePerHour", label: "Standard Tier" },
              { key: "premiumRatePerHour", label: "Premium Tier" },
              { key: "vipRatePerHour", label: "VIP Tier" },
              { key: "overnightRate", label: "Overnight Flat Rate" },
              { key: "studentDiscount", label: "Student Discount (%)" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/20 border border-border/50 group hover:border-primary/30 transition-colors">
                <label className="text-sm font-bold text-foreground/80">{label}</label>
                <div className="flex items-center gap-3 w-40">
                  <span className="text-primary font-black text-lg">₱</span>
                  <Input
                    type="number"
                    value={(form as any)[key]}
                    onChange={e => setForm({ ...form, [key]: +e.target.value })}
                    className="bg-muted/50 border-border h-12 rounded-xl px-4 font-bold text-right"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card className="bg-card border-border shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border py-4"><CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">System Protocols</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-6">
            {[
              { key: "allowAnonymousFeedback", label: "Anonymous Feedback", desc: "Permit subjects to submit data without identification" },
              { key: "maintenanceMode", label: "Maintenance Lockdown", desc: "Restrict all player access to the grid" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-muted/20 border border-border/50">
                <div>
                  <div className="font-bold text-sm text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{desc}</div>
                </div>
                <Switch
                  checked={(form as any)[key]}
                  onCheckedChange={v => setForm({ ...form, [key]: v })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Display */}
        <Card className="bg-card border-border shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border py-4"><CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Visual Interface</CardTitle></CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/20 border border-border/50">
              <div>
                <div className="font-bold text-sm text-foreground">Theme Engine</div>
                <div className="text-xs text-muted-foreground mt-1">Status: {theme.toUpperCase()} MODE ACTIVE</div>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="h-12 border-border rounded-xl px-5 gap-2 font-bold hover:bg-primary/10 transition-all">
                {theme === "dark" ? <Sun className="w-4 h-4 text-orange-500" /> : <Moon className="w-4 h-4 text-primary" />}
                {theme === "dark" ? "IGNITE LIGHT" : "ENGAGE DARK"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>

  );
}

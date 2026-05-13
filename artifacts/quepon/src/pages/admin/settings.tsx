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
            <h1 className="text-3xl font-bold font-display flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" /> Settings
            </h1>
            <p className="text-muted-foreground">Configure shop parameters</p>
          </div>
          <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/80">
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save All
          </Button>
        </div>

        {/* Shop Info */}
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
          <CardHeader><CardTitle className="text-base">Shop Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground uppercase tracking-widest">Shop Name</label>
              <Input value={form.shopName} onChange={e => setForm({ ...form, shopName: e.target.value })} className="bg-black/30 border-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">Opens</label>
                <Input type="time" value={form.openTime} onChange={e => setForm({ ...form, openTime: e.target.value })} className="bg-black/30 border-white/10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">Closes</label>
                <Input type="time" value={form.closeTime} onChange={e => setForm({ ...form, closeTime: e.target.value })} className="bg-black/30 border-white/10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground uppercase tracking-widest">Max Session Hours</label>
              <Input type="number" value={form.maxSessionHours} onChange={e => setForm({ ...form, maxSessionHours: +e.target.value })} className="bg-black/30 border-white/10" />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
          <CardHeader><CardTitle className="text-base">Rates (PHP/hour)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "standardRatePerHour", label: "Standard PC" },
              { key: "premiumRatePerHour", label: "Premium PC" },
              { key: "vipRatePerHour", label: "VIP PC" },
              { key: "overnightRate", label: "Overnight Flat Rate" },
              { key: "studentDiscount", label: "Student Rate" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <label className="text-sm font-medium flex-1">{label}</label>
                <div className="flex items-center gap-2 w-36">
                  <span className="text-muted-foreground">₱</span>
                  <Input
                    type="number"
                    value={(form as any)[key]}
                    onChange={e => setForm({ ...form, [key]: +e.target.value })}
                    className="bg-black/30 border-white/10"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
          <CardHeader><CardTitle className="text-base">Feature Toggles</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "allowAnonymousFeedback", label: "Allow Anonymous Feedback", desc: "Players can submit feedback without showing username" },
              { key: "maintenanceMode", label: "Maintenance Mode", desc: "Disable player logins during maintenance" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
                <div>
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                </div>
                <Switch
                  checked={(form as any)[key]}
                  onCheckedChange={v => setForm({ ...form, [key]: v })}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Display */}
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
          <CardHeader><CardTitle className="text-base">Display</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
              <div>
                <div className="font-medium text-sm">Color Theme</div>
                <div className="text-xs text-muted-foreground mt-0.5">Currently: {theme} mode</div>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="border-white/10 gap-2">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                Switch to {theme === "dark" ? "Light" : "Dark"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

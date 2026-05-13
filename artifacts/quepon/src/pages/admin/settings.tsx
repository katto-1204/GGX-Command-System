import { useState, useEffect } from "react";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { Settings, Save, Moon, Sun, Loader2, Cpu, DollarSign, MonitorPlay, Shield } from "lucide-react";
import { motion } from "framer-motion";

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
      onSuccess: () => toast({ title: "SYSTEM PROTOCOLS SAVED", description: "Global settings updated successfully." }),
      onError: () => toast({ title: "UPDATE OVERRIDE FAILED", variant: "destructive" }),
    });
  };

  if (isLoading) {
    return (
      <AdminLayout breadcrumbs={[{ label: "System Config" }]}>
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
            <Settings className="w-10 h-10 text-primary opacity-20" />
          </motion.div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Accessing Core Directives...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout breadcrumbs={[{ label: "System Config" }]}>
      <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Settings className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Core Configuration</span>
            </div>
            <h1 className="text-4xl font-black font-display tracking-tight text-foreground">SYSTEM <span className="text-primary">SETTINGS</span></h1>
            <p className="text-muted-foreground font-medium text-sm">Configure global operational parameters and display modes.</p>
          </div>
          
          <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_10px_20px_rgba(var(--primary),0.2)] transition-all active:scale-95 group">
            {updateMutation.isPending ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3 opacity-70 group-hover:scale-110 transition-transform" />}
            Commit Changes
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Shop Info */}
          <Card className="bg-card border-border shadow-xl rounded-[2.5rem] overflow-hidden group">
            <CardHeader className="bg-muted/30 border-b border-border py-6 px-8">
              <CardTitle className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] text-foreground">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                  <MonitorPlay className="w-5 h-5 text-primary" />
                </div>
                Facility Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Shop Brand Identity</label>
                <Input value={form.shopName} onChange={e => setForm({ ...form, shopName: e.target.value })} className="bg-muted/50 border-border h-12 rounded-xl px-4 font-bold focus:border-primary/50 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Activation Time</label>
                  <Input type="time" value={form.openTime} onChange={e => setForm({ ...form, openTime: e.target.value })} className="bg-muted/50 border-border h-12 rounded-xl px-4 font-bold font-mono focus:border-primary/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Deactivation Time</label>
                  <Input type="time" value={form.closeTime} onChange={e => setForm({ ...form, closeTime: e.target.value })} className="bg-muted/50 border-border h-12 rounded-xl px-4 font-bold font-mono focus:border-primary/50 transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Max Session (Hours)</label>
                <Input type="number" value={form.maxSessionHours} onChange={e => setForm({ ...form, maxSessionHours: +e.target.value })} className="bg-muted/50 border-border h-12 rounded-xl px-4 font-bold font-mono text-primary focus:border-primary/50 transition-colors" />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-card border-border shadow-xl rounded-[2.5rem] overflow-hidden group">
            <CardHeader className="bg-muted/30 border-b border-border py-6 px-8">
              <CardTitle className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] text-foreground">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                Pricing Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-8">
              {[
                { key: "standardRatePerHour", label: "Standard Tier" },
                { key: "premiumRatePerHour", label: "Premium Tier" },
                { key: "vipRatePerHour", label: "VIP Tier" },
                { key: "overnightRate", label: "Overnight Flat" },
                { key: "studentDiscount", label: "Student Disc. (%)" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/20 border border-border/50 hover:border-primary/30 transition-colors">
                  <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">{label}</label>
                  <div className="flex items-center gap-3 w-32">
                    <span className="text-primary font-black text-lg opacity-50">₱</span>
                    <Input
                      type="number"
                      value={(form as any)[key]}
                      onChange={e => setForm({ ...form, [key]: +e.target.value })}
                      className="bg-muted/50 border-border h-10 rounded-xl px-3 font-bold font-mono text-right focus:border-primary/50"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card className="bg-card border-border shadow-xl rounded-[2.5rem] overflow-hidden group">
            <CardHeader className="bg-muted/30 border-b border-border py-6 px-8">
              <CardTitle className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] text-foreground">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                Security Protocols
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-8">
              {[
                { key: "allowAnonymousFeedback", label: "Anonymous Feedback", desc: "Permit subjects to submit data without identification" },
                { key: "maintenanceMode", label: "Maintenance Lockdown", desc: "Restrict all player access to the grid (Offline Mode)" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-muted/20 border border-border/50 hover:border-primary/20 transition-colors">
                  <div>
                    <div className="font-bold text-sm text-foreground uppercase tracking-tight">{label}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{desc}</div>
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
          <Card className="bg-card border-border shadow-xl rounded-[2.5rem] overflow-hidden group">
            <CardHeader className="bg-muted/30 border-b border-border py-6 px-8">
              <CardTitle className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] text-foreground">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                  <Cpu className="w-5 h-5 text-primary" />
                </div>
                Display Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-center justify-between p-6 rounded-2xl bg-muted/20 border border-border/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                <div className="relative z-10">
                  <div className="font-bold text-sm text-foreground uppercase tracking-tight">System Theme</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-mono">
                    STATE: {theme === 'dark' ? <span className="text-primary">DARK_MODE</span> : <span className="text-orange-500">LIGHT_MODE</span>}
                  </div>
                </div>
                <Button variant="outline" onClick={toggleTheme} className="h-12 border-border bg-card rounded-xl px-5 gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all relative z-10 shadow-sm">
                  {theme === "dark" ? <Sun className="w-4 h-4 text-orange-500" /> : <Moon className="w-4 h-4 text-primary" />}
                  {theme === "dark" ? "IGNITE LIGHT" : "ENGAGE DARK"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

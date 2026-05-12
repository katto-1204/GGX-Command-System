import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">System Settings</h1>
          <p className="text-muted-foreground">Configure shop parameters</p>
        </div>

        <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <SettingsIcon className="w-12 h-12 mb-4 opacity-20" />
            <h2 className="text-lg font-bold text-white mb-2">Settings Module Pending</h2>
            <p>System configuration UI is not included in the current build scope.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

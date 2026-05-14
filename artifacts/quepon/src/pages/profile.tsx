import { useAuth } from "@/hooks/use-auth";
import { useLogoutUser } from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut, Clock, Wallet, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { clearAuthenticatedUser } from "@/lib/auth-token";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const logoutMutation = useLogoutUser();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        clearAuthenticatedUser(queryClient);
        setLocation("/role-selection");
      }
    });
  };

  const playtimeHours = Math.floor((user?.totalPlayTimeMinutes || 0) / 60);

  return (
    <PlayerLayout>
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary text-3xl font-display font-bold">
            {user?.username?.[0]?.toUpperCase() || <User />}
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">{user?.displayName || user?.username}</h1>
            <p className="text-muted-foreground text-sm font-mono">@{user?.username}</p>
            <div className="inline-flex items-center gap-1 mt-2 text-xs font-medium bg-white/10 px-2 py-0.5 rounded text-white/70">
              <ShieldCheck className="w-3 h-3 text-green-400" /> Player Account
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] backdrop-blur-sm">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Clock className="w-6 h-6 text-blue-400 mb-2" />
              <div className="text-2xl font-bold font-mono">{playtimeHours}h</div>
              <div className="text-xs text-muted-foreground uppercase">Total Playtime</div>
            </CardContent>
          </Card>
          <Card className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] backdrop-blur-sm">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Wallet className="w-6 h-6 text-green-400 mb-2" />
              <div className="text-2xl font-bold font-mono">₱{(user?.totalSpent || 0).toFixed(0)}</div>
              <div className="text-xs text-muted-foreground uppercase">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] overflow-hidden">
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            <div className="p-4 flex justify-between items-center text-sm cursor-pointer hover:bg-white/5 transition-colors">
              <span>Account Details</span>
            </div>
            <div className="p-4 flex justify-between items-center text-sm cursor-pointer hover:bg-white/5 transition-colors">
              <span>Change Password</span>
            </div>
            <div className="p-4 flex justify-between items-center text-sm cursor-pointer hover:bg-white/5 transition-colors">
              <span>Session History</span>
            </div>
          </div>
        </Card>

        <Button 
          variant="destructive" 
          className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>
    </PlayerLayout>
  );
}

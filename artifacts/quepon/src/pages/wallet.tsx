import { useListWalletTransactions } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Wallet() {
  const { user } = useAuth();
  const { data: transactions, isLoading } = useListWalletTransactions();

  const balance = user?.walletBalance || 0;
  // Assuming average rate is 40/hr for display purposes
  const estHours = Math.floor(balance / 40);

  return (
    <PlayerLayout>
      <div className="space-y-6 pt-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Wallet</h1>
          <p className="text-muted-foreground text-sm">Manage your funds</p>
        </div>

        <Card className="bg-gradient-to-br from-green-500/20 via-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.04)] border-[rgba(34,197,94,0.3)] backdrop-blur-sm overflow-hidden">
          <CardContent className="p-8 relative">
            <WalletIcon className="absolute right-6 top-1/2 -translate-y-1/2 w-32 h-32 text-green-500/10 pointer-events-none" />
            
            <div className="text-sm text-green-400 uppercase tracking-wider mb-2 font-medium">Available Balance</div>
            <div className="text-5xl font-bold font-mono text-white tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              ₱{balance.toFixed(2)}
            </div>
            
            <div className="inline-flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-sm text-muted-foreground">
              <span>≈ {estHours} hours playtime</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Transaction History</h2>
          
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map(tx => {
                const isPositive = ["topUp", "refund", "adjustment"].includes(tx.type) && tx.amount > 0;
                
                return (
                  <Card key={tx.id} className="bg-[rgba(255,255,255,0.02)] border-white/5">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-black/40 border border-white/5 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-medium text-sm capitalize">{tx.type.replace(/([A-Z])/g, ' $1').trim()}</div>
                          <div className="text-xs text-muted-foreground">{format(new Date(tx.createdAt), 'MMM d, h:mm a')}</div>
                        </div>
                      </div>
                      <div className={`font-mono font-bold ${isPositive ? 'text-green-400' : 'text-white'}`}>
                        {isPositive ? '+' : '-'}₱{Math.abs(tx.amount).toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-[rgba(255,255,255,0.02)] rounded-xl border border-white/5">
              No transactions yet.
            </div>
          )}
        </div>
      </div>
    </PlayerLayout>
  );
}

import { useState } from "react";
import { useListPlayers, useUpdatePlayerStatus, getListPlayersQueryKey, useRegisterPlayer } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Search, Ban, CheckCircle, Wallet, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

export default function AdminPlayers() {
  const [search, setSearch] = useState("");
  const { data: players, isLoading } = useListPlayers({ search });
  const updateStatusMutation = useUpdatePlayerStatus();
  const registerMutation = useRegisterPlayer();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "", displayName: "", phone: "" });

  const handleStatusChange = (id: string, status: any) => {
    updateStatusMutation.mutate({ userId: id, data: { status } }, {
      onSuccess: () => {
        toast({ title: `Player status updated to ${status}` });
        queryClient.invalidateQueries({ queryKey: getListPlayersQueryKey() });
      },
      onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
    });
  };

  const handleCreatePlayer = () => {
    if (!newUser.username || !newUser.password) {
      toast({ title: "Username and password are required", variant: "destructive" });
      return;
    }
    registerMutation.mutate({ data: { username: newUser.username, password: newUser.password, displayName: newUser.displayName || undefined, phone: newUser.phone || undefined } }, {
      onSuccess: () => {
        toast({ title: `Player @${newUser.username} created successfully` });
        setCreateOpen(false);
        setNewUser({ username: "", password: "", displayName: "", phone: "" });
        queryClient.invalidateQueries({ queryKey: getListPlayersQueryKey() });
      },
      onError: (err: any) => toast({ title: "Failed to create player", description: err.message || "Username may already exist.", variant: "destructive" }),
    });
  };

  return (
    <AdminLayout breadcrumbs={[{ label: "Players" }]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black font-display tracking-tight text-foreground uppercase italic leading-none">PLAYERS</h1>
            <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] opacity-60">Manage player accounts</p>
          </div>
          <div className="flex gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-muted/50 border-border"
              />
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/80 gap-2">
                  <UserPlus className="w-4 h-4" /> Add Player
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Create New Player Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground uppercase tracking-widest">Username *</label>
                    <Input value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} placeholder="player_username" className="bg-muted/50 border-border" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground uppercase tracking-widest">Password *</label>
                    <Input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Min 6 characters" className="bg-muted/50 border-border" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground uppercase tracking-widest">Display Name</label>
                    <Input value={newUser.displayName} onChange={e => setNewUser({ ...newUser, displayName: e.target.value })} placeholder="John Doe (optional)" className="bg-muted/50 border-border" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground uppercase tracking-widest">Phone</label>
                    <Input value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} placeholder="09xxxxxxxxx (optional)" className="bg-muted/50 border-border" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1 border-border" onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button className="flex-1 bg-primary" onClick={handleCreatePlayer} disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>


        <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">User</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Balance</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Played</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : !players || players.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No players found
                    </TableCell>
                  </TableRow>
                ) : (
                  players.map((player) => (
                    <TableRow key={player.id} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="font-bold text-foreground">{player.displayName || player.username}</div>
                        <div className="text-xs text-muted-foreground font-mono">@{player.username}</div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs border-white/20 text-muted-foreground">{player.role}</Badge>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-green-400">₱{player.walletBalance.toFixed(2)}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{Math.floor((player.totalPlayTimeMinutes||0)/60)}h {(player.totalPlayTimeMinutes||0)%60}m</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          player.status === "active" ? "border-green-500/50 text-green-500" :
                          player.status === "banned" ? "border-red-500/50 text-red-500" :
                          "border-gray-500/50 text-gray-500"
                        }>
                          {player.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/topup?userId=${player.id}`}>
                            <Button size="sm" variant="outline" className="border-green-500/20 text-green-500 hover:bg-green-500/10 px-2" title="Add Credits">
                              <Wallet className="w-4 h-4" />
                            </Button>
                          </Link>
                          {player.status === "active" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/20 text-red-500 hover:bg-red-500/10 px-2"
                              onClick={() => handleStatusChange(player.id, "banned")}
                              title="Suspend User"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500/20 text-green-500 hover:bg-green-500/10 px-2"
                              onClick={() => handleStatusChange(player.id, "active")}
                              title="Restore User"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

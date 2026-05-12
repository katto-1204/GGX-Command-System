import { useState } from "react";
import { useListSessions, useExtendSession, useEndSession, getListSessionsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, XSquare, Plus, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminSessions() {
  const [search, setSearch] = useState("");
  const { data: sessions, isLoading } = useListSessions(undefined, { query: { refetchInterval: 10000 } as any });
  
  const extendMutation = useExtendSession();
  const endMutation = useEndSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleExtend = (id: string) => {
    extendMutation.mutate({ sessionId: id, data: { additionalMinutes: 60 } }, {
      onSuccess: () => {
        toast({ title: "Session extended by 1 hour" });
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
      }
    });
  };

  const handleEnd = (id: string) => {
    endMutation.mutate({ sessionId: id }, {
      onSuccess: () => {
        toast({ title: "Session ended" });
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
      }
    });
  };

  const activeSessions = sessions?.filter(s => ["active", "extended", "locked"].includes(s.status)) || [];
  
  const filteredSessions = activeSessions.filter(s => 
    s.username.toLowerCase().includes(search.toLowerCase()) || 
    (s.pcLabel && s.pcLabel.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-display">Active Sessions</h1>
            <p className="text-muted-foreground">Monitor and manage ongoing playtime</p>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search player or PC..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-black/40 border-white/10"
            />
          </div>
        </div>

        <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead>PC</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Time Left</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No active sessions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => (
                    <TableRow key={session.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-mono font-bold text-primary">{session.pcLabel}</TableCell>
                      <TableCell className="font-medium">{session.username}</TableCell>
                      <TableCell>
                        <span className={`font-mono ${session.remainingSeconds && session.remainingSeconds < 300 ? 'text-red-400 font-bold' : 'text-white'}`}>
                          {session.remainingSeconds ? Math.floor(session.remainingSeconds / 60) : 0}m
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-green-400">₱{session.costSoFar?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          session.status === "locked" ? "border-red-500/50 text-red-500" :
                          "border-green-500/50 text-green-500"
                        }>
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-white/10 hover:bg-white/10 px-2"
                            onClick={() => handleExtend(session.id)}
                            title="Add 1 Hour"
                          >
                            <Plus className="w-4 h-4 text-primary" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                            onClick={() => handleEnd(session.id)}
                          >
                            <XSquare className="w-4 h-4 mr-1" /> End
                          </Button>
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

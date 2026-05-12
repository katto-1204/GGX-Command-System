import { useState } from "react";
import { useListFeedback, useResolveFeedback, getListFeedbackQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function AdminFeedback() {
  const { data: feedbacks, isLoading } = useListFeedback();
  const resolveMutation = useResolveFeedback();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [resolutionNote, setResolutionNote] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleResolve = (status: "resolved" | "escalated") => {
    if (!selectedId) return;
    resolveMutation.mutate({
      feedbackId: selectedId,
      data: { status, resolutionNote }
    }, {
      onSuccess: () => {
        toast({ title: `Feedback marked as ${status}` });
        setSelectedId(null);
        setResolutionNote("");
        queryClient.invalidateQueries({ queryKey: getListFeedbackQueryKey() });
      }
    });
  };

  const openFeedback = feedbacks?.filter(f => ["open", "reviewing"].includes(f.status)) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Feedback Inbox</h1>
          <p className="text-muted-foreground">Player reports and suggestions</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : openFeedback.length === 0 ? (
          <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>Inbox zero! No open feedback.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {openFeedback.map(fb => (
              <Card key={fb.id} className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white/5 ${fb.category === 'issue' ? 'text-red-400' : 'text-primary'}`}>
                        {fb.category === 'issue' ? <AlertCircle className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          {fb.isAnonymous ? "Anonymous" : fb.username}
                          <Badge variant="outline" className="uppercase text-[10px] bg-black/40 border-white/10">{fb.category}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(fb.createdAt), 'MMM d, h:mm a')}
                          {fb.relatedPcId && ` • Related to PC: ${fb.relatedPcId}`}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                      {fb.status}
                    </Badge>
                  </div>
                  
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
                    <p className="text-sm whitespace-pre-wrap">{fb.message}</p>
                  </div>

                  <div className="flex justify-end">
                    <Dialog open={selectedId === fb.id} onOpenChange={(open) => !open && setSelectedId(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10" onClick={() => setSelectedId(fb.id)}>
                          Respond / Resolve
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0A0A0F] border-white/10">
                        <DialogHeader>
                          <DialogTitle>Resolve Feedback</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Textarea 
                            placeholder="Add resolution notes (optional)"
                            value={resolutionNote}
                            onChange={e => setResolutionNote(e.target.value)}
                            className="bg-black/40 border-white/10"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" className="border-red-500/20 text-red-500 hover:bg-red-500/10" onClick={() => handleResolve("escalated")}>
                              Escalate
                            </Button>
                            <Button className="bg-green-500 hover:bg-green-600 text-black font-bold" onClick={() => handleResolve("resolved")}>
                              <CheckCircle className="w-4 h-4 mr-2" /> Mark Resolved
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

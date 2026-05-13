import { useState } from "react";
import { useListFeedback, useResolveFeedback, getListFeedbackQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { MessageSquare, CheckCircle, AlertCircle, Loader2, Mail, Terminal, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
        toast({ title: `INCIDENT ${status.toUpperCase()}`, description: "Log updated successfully." });
        setSelectedId(null);
        setResolutionNote("");
        queryClient.invalidateQueries({ queryKey: getListFeedbackQueryKey() });
      }
    });
  };

  const openFeedback = feedbacks?.filter(f => ["open", "reviewing"].includes(f.status)) || [];

  return (
    <AdminLayout breadcrumbs={[{ label: "Incident Reports" }]}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Mail className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Comms Channel</span>
            </div>
            <h1 className="text-4xl font-black font-display tracking-tight text-foreground">INCIDENT <span className="text-primary">REPORTS</span></h1>
            <p className="text-muted-foreground font-medium text-sm">Review operational anomalies and user dispatches.</p>
          </div>
          
          <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-[8px] font-black text-primary uppercase tracking-widest">Pending Dispatches</span>
            <span className="text-xl font-black font-mono text-foreground">{openFeedback.length}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Decrypting transmissions...</span>
          </div>
        ) : openFeedback.length === 0 ? (
          <Card className="bg-card rounded-[3rem] border-2 border-dashed border-border overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-24 text-muted-foreground/40">
              <MessageSquare className="w-16 h-16 mb-6 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">COMMUNICATION CHANNELS CLEAR</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <AnimatePresence>
              {openFeedback.map((fb, i) => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-card border-border rounded-[2rem] hover:border-primary/30 transition-all shadow-sm group">
                    <CardContent className="p-6 relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                      
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                            fb.category === 'issue' ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-primary/10 text-primary border border-primary/20"
                          )}>
                            {fb.category === 'issue' ? <AlertCircle className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
                              {fb.isAnonymous ? "UNKNOWN SUBJECT" : fb.username}
                              <Badge variant="outline" className={cn(
                                "uppercase text-[8px] tracking-widest px-2",
                                fb.category === 'issue' ? "border-red-500/30 text-red-500 bg-red-500/5" : "border-primary/30 text-primary bg-primary/5"
                              )}>{fb.category}</Badge>
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mt-1">
                              <Terminal className="w-3 h-3" />
                              {format(new Date(fb.createdAt), 'MMM d, HH:mm')}
                              {fb.relatedPcId && <span className="text-primary ml-1">[{fb.relatedPcId}]</span>}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 text-[8px] font-black uppercase tracking-widest bg-yellow-500/5 px-3">
                          {fb.status}
                        </Badge>
                      </div>
                      
                      <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 mb-6 relative z-10 font-mono text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors min-h-[100px]">
                        {fb.message}
                      </div>

                      <div className="flex justify-end relative z-10">
                        <Dialog open={selectedId === fb.id} onOpenChange={(open) => !open && setSelectedId(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="h-10 px-6 rounded-xl bg-card border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 font-black uppercase text-[10px] tracking-widest transition-all" 
                              onClick={() => setSelectedId(fb.id)}
                            >
                              Action Required
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-card border-border sm:max-w-md rounded-[2.5rem] p-8 overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                            <DialogHeader className="mb-6">
                              <DialogTitle className="text-2xl font-black font-display tracking-tight uppercase italic flex items-center gap-2">
                                <Send className="w-6 h-6 text-primary" />
                                Resolve Incident
                              </DialogTitle>
                              <DialogDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Log resolution metrics and close dispatch.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 pt-2">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Analyst Notes</label>
                                <Textarea 
                                  placeholder="ENTER RESOLUTION LOG..."
                                  value={resolutionNote}
                                  onChange={e => setResolutionNote(e.target.value)}
                                  className="bg-muted/50 border-border rounded-xl focus:border-primary/50 resize-none h-32 text-sm font-mono"
                                />
                              </div>
                              <div className="flex gap-3 justify-end pt-4">
                                <Button 
                                  variant="outline" 
                                  className="h-12 px-6 rounded-2xl border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all" 
                                  onClick={() => handleResolve("escalated")}
                                >
                                  Escalate
                                </Button>
                                <Button 
                                  className="h-12 px-6 rounded-2xl bg-green-500 text-black hover:bg-green-400 font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-green-500/20" 
                                  onClick={() => handleResolve("resolved")}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" /> Mark Resolved
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

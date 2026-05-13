import { useState } from "react";
import { useListPromos, useCreatePromo, useDeletePromo, getListPromosQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Ticket, Plus, Trash2, Loader2, Sparkles, Megaphone, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminPromos() {
  const { data: promos, isLoading } = useListPromos();
  const createMutation = useCreatePromo();
  const deleteMutation = useDeletePromo();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", tag: "discount", displayPriority: 0 });

  const handleCreate = () => {
    createMutation.mutate({ data: { ...formData, isActive: true } }, {
      onSuccess: () => {
        toast({ title: "CAMPAIGN DEPLOYED", description: "Promotional directive active." });
        setIsOpen(false);
        setFormData({ title: "", description: "", tag: "discount", displayPriority: 0 });
        queryClient.invalidateQueries({ queryKey: getListPromosQueryKey() });
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ promoId: id }, {
      onSuccess: () => {
        toast({ title: "CAMPAIGN PURGED", description: "Promotional directive removed." });
        queryClient.invalidateQueries({ queryKey: getListPromosQueryKey() });
      }
    });
  };

  return (
    <AdminLayout breadcrumbs={[{ label: "Promotions" }]}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Megaphone className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Marketing Engine</span>
            </div>
            <h1 className="text-4xl font-black font-display tracking-tight text-foreground">PROMO <span className="text-primary">MANAGER</span></h1>
            <p className="text-muted-foreground font-medium text-sm">Deploy targeted campaigns and player incentives.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95">
                <Plus className="w-4 h-4 mr-2" /> Launch Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border sm:max-w-md rounded-[2.5rem] p-8 overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black font-display tracking-tight uppercase italic flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  New Directive
                </DialogTitle>
                <DialogDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Initialize promotional parameters
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Designation</label>
                  <Input 
                    value={formData.title} 
                    onChange={e => setFormData(p => ({...p, title: e.target.value}))} 
                    className="bg-muted/50 border-border h-12 rounded-xl focus:border-primary/50 text-sm font-bold" 
                    placeholder="ENTER CAMPAIGN TITLE"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Parameters</label>
                  <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData(p => ({...p, description: e.target.value}))} 
                    className="bg-muted/50 border-border rounded-xl focus:border-primary/50 resize-none h-24 text-sm" 
                    placeholder="ENTER CAMPAIGN DETAILS"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Classification</label>
                    <Input 
                      value={formData.tag} 
                      onChange={e => setFormData(p => ({...p, tag: e.target.value}))} 
                      className="bg-muted/50 border-border h-12 rounded-xl focus:border-primary/50 text-xs font-bold uppercase" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Priority (Level)</label>
                    <Input 
                      type="number" 
                      value={formData.displayPriority} 
                      onChange={e => setFormData(p => ({...p, displayPriority: parseInt(e.target.value)||0}))} 
                      className="bg-muted/50 border-border h-12 rounded-xl focus:border-primary/50 text-xs font-mono font-bold" 
                    />
                  </div>
                </div>
                <Button 
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-[0.2em] mt-4 shadow-lg shadow-primary/20 transition-all active:scale-95" 
                  onClick={handleCreate} 
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Target className="w-5 h-5 mr-2" />}
                  Execute Launch
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className="h-40 rounded-[2rem] bg-muted animate-pulse" />)
          ) : !promos || promos.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-card rounded-[3rem] border-2 border-dashed border-border flex flex-col items-center">
              <Megaphone className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.3em]">Zero Active Campaigns</p>
            </div>
          ) : (
            <AnimatePresence>
              {promos.map((promo, i) => (
                <motion.div 
                  key={promo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-card border-border rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all shadow-sm">
                    <CardContent className="p-6 relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                      
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <Badge variant="outline" className="border-primary/30 text-primary uppercase text-[9px] font-black tracking-widest bg-primary/5 px-3 py-1">
                          {promo.tag}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors" 
                          onClick={() => handleDelete(promo.id)}
                          title="Purge Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="relative z-10">
                        <h3 className="font-black font-display text-xl uppercase tracking-tight text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">{promo.title}</h3>
                        <p className="text-xs text-muted-foreground/80 line-clamp-2 font-medium leading-relaxed">{promo.description}</p>
                      </div>
                      
                      <div className="mt-6 flex items-center gap-2 relative z-10">
                         <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                           <span className="text-[9px] font-black font-mono text-muted-foreground">P{promo.displayPriority}</span>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

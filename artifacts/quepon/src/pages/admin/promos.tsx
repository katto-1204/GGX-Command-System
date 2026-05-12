import { useState } from "react";
import { useListPromos, useCreatePromo, useDeletePromo, getListPromosQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Ticket, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

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
        toast({ title: "Promo created" });
        setIsOpen(false);
        setFormData({ title: "", description: "", tag: "discount", displayPriority: 0 });
        queryClient.invalidateQueries({ queryKey: getListPromosQueryKey() });
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ promoId: id }, {
      onSuccess: () => {
        toast({ title: "Promo deleted" });
        queryClient.invalidateQueries({ queryKey: getListPromosQueryKey() });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-display">Promo Manager</h1>
            <p className="text-muted-foreground">Manage featured content for players</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> New Promo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0A0A0F] border-white/10">
              <DialogHeader>
                <DialogTitle>Create Promo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} className="bg-black/40 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} className="bg-black/40 border-white/10 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tag</label>
                    <Input value={formData.tag} onChange={e => setFormData(p => ({...p, tag: e.target.value}))} placeholder="e.g. discount, event" className="bg-black/40 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority (higher=first)</label>
                    <Input type="number" value={formData.displayPriority} onChange={e => setFormData(p => ({...p, displayPriority: parseInt(e.target.value)||0}))} className="bg-black/40 border-white/10" />
                  </div>
                </div>
                <Button className="w-full" onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Promo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : !promos || promos.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-[rgba(255,255,255,0.02)] rounded-xl border border-dashed border-white/10">
              No promos configured.
            </div>
          ) : (
            promos.map(promo => (
              <Card key={promo.id} className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="border-primary/50 text-primary uppercase">{promo.tag}</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-400" onClick={() => handleDelete(promo.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{promo.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{promo.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

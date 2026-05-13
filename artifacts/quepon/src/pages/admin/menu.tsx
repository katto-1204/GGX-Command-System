import { useState } from "react";
import { useListMenuItems, useCreateMenuItem, useDeleteMenuItem, getListMenuItemsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coffee, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminMenu() {
  const { data: menu, isLoading } = useListMenuItems();
  const createMutation = useCreateMenuItem();
  const deleteMutation = useDeleteMenuItem();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", category: "drinks", price: 50, description: "" });

  const handleCreate = () => {
    createMutation.mutate({ data: { ...formData, isAvailable: true, displayOrder: 0 } }, {
      onSuccess: () => {
        toast({ title: "Menu item created" });
        setIsOpen(false);
        setFormData({ name: "", category: "drinks", price: 50, description: "" });
        queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ itemId: id }, {
      onSuccess: () => {
        toast({ title: "Item deleted" });
        queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Logistics & Provisioning</span>
            </div>
            <h1 className="text-4xl font-black font-display tracking-tight text-foreground uppercase">MENU <span className="text-primary">CATALOG</span></h1>
            <p className="text-muted-foreground font-medium uppercase tracking-[0.1em] text-xs mt-1">Configure food and beverage inventory for active deployments.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 h-12 px-8 rounded-xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                <Plus className="w-4 h-4 mr-2" /> Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border backdrop-blur-2xl max-w-md rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-tight">Register New Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Item Designation</label>
                  <Input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="bg-muted border-border h-12 rounded-xl px-4 font-medium" placeholder="e.g. Energy Shot X" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Category</label>
                    <Select value={formData.category} onValueChange={v => setFormData(p => ({...p, category: v}))}>
                      <SelectTrigger className="bg-muted border-border h-12 rounded-xl"><SelectValue/></SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="drinks" className="font-black uppercase text-[10px] tracking-widest">Drinks</SelectItem>
                        <SelectItem value="snacks" className="font-black uppercase text-[10px] tracking-widest">Snacks</SelectItem>
                        <SelectItem value="meals" className="font-black uppercase text-[10px] tracking-widest">Meals</SelectItem>
                        <SelectItem value="services" className="font-black uppercase text-[10px] tracking-widest">Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Cost Unit (₱)</label>
                    <Input type="number" value={formData.price} onChange={e => setFormData(p => ({...p, price: parseFloat(e.target.value)||0}))} className="bg-muted border-border h-12 rounded-xl font-mono font-bold" />
                  </div>
                </div>
                <Button className="w-full h-14 bg-primary hover:bg-primary/90 font-black uppercase tracking-[0.2em] text-xs rounded-xl mt-4" onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />} Initialize Resource
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-10">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                 <Loader2 className="w-10 h-10 text-primary/40" />
               </motion.div>
               <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Synchronizing Manifest...</p>
            </div>
          ) : !menu || menu.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center bg-card border border-dashed border-border rounded-[2.5rem]">
              <Coffee className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <p className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest">Operational Manifest Empty</p>
            </div>
          ) : (
            menu.map(item => (
              <Card key={item.id} className="bg-card border-border hover:border-primary/20 transition-all group rounded-2xl overflow-hidden">
                <CardContent className="p-6 flex items-center gap-5">
                  <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center border border-border group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                    <Coffee className="w-6 h-6 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-black text-sm text-foreground uppercase tracking-tight truncate">{item.name}</h3>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground/20 hover:text-red-400 hover:bg-red-400/10 transition-all rounded-lg" 
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                       <Badge variant="outline" className="text-[8px] h-4 font-black uppercase tracking-widest bg-muted/50 border-border px-1.5">{item.category}</Badge>
                       <div className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                       <div className="font-mono text-primary font-black text-xs tracking-tighter">₱{item.price.toFixed(2)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

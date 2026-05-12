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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-display">Menu Catalog</h1>
            <p className="text-muted-foreground">Manage F&B offerings</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0A0A0F] border-white/10">
              <DialogHeader>
                <DialogTitle>Create Menu Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="bg-black/40 border-white/10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={formData.category} onValueChange={v => setFormData(p => ({...p, category: v}))}>
                      <SelectTrigger className="bg-black/40 border-white/10"><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="drinks">Drinks</SelectItem>
                        <SelectItem value="snacks">Snacks</SelectItem>
                        <SelectItem value="meals">Meals</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price (₱)</label>
                    <Input type="number" value={formData.price} onChange={e => setFormData(p => ({...p, price: parseFloat(e.target.value)||0}))} className="bg-black/40 border-white/10 font-mono" />
                  </div>
                </div>
                <Button className="w-full" onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : !menu || menu.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-[rgba(255,255,255,0.02)] rounded-xl border border-dashed border-white/10">
              No menu items configured.
            </div>
          ) : (
            menu.map(item => (
              <Card key={item.id} className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center border border-white/5">
                    <Coffee className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm leading-tight">{item.name}</h3>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-red-400 -mt-1 -mr-2" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <Badge variant="outline" className="text-[10px] mt-1 bg-black/20 border-white/10 uppercase">{item.category}</Badge>
                    <div className="font-mono text-green-400 font-bold mt-1 text-sm">₱{item.price.toFixed(2)}</div>
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

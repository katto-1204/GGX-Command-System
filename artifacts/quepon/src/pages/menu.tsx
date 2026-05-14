import { useState } from "react";
import { useListMenuItems, useCreateOrder } from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee, Plus, Minus, ShoppingCart, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function Menu() {
  const { data: menuItems, isLoading } = useListMenuItems();
  const createOrderMutation = useCreateOrder();
  const { toast } = useToast();

  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [category, setCategory] = useState("drinks");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const availableItems = menuItems?.filter(i => i.isAvailable) || [];
  const itemsByCategory = availableItems.filter(i => i.category === category);

  const addToCart = (item: any) => {
    setCart(prev => ({
      ...prev,
      [item.id]: {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: (prev[item.id]?.quantity || 0) + 1
      }
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[id]?.quantity > 1) {
        next[id].quantity--;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const cartItems = Object.values(cart);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    createOrderMutation.mutate({
      data: {
        items: cartItems.map(item => ({ itemId: item.id, quantity: item.quantity }))
      }
    }, {
      onSuccess: () => {
        toast({ title: "Order placed successfully!" });
        setCart({});
        setIsSheetOpen(false);
      },
      onError: (err: any) => {
        toast({ title: "Failed to place order", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <PlayerLayout>
      <div className="space-y-6 pt-4 pb-24">
        <div>
          <h1 className="text-2xl font-bold font-display">Shop</h1>
          <p className="text-muted-foreground text-sm">Select items and order</p>
        </div>

        <Tabs defaultValue="drinks" onValueChange={setCategory}>
          <TabsList className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] p-1 rounded-xl w-full h-auto flex flex-wrap gap-1">
            <TabsTrigger value="drinks" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Drinks</TabsTrigger>
            <TabsTrigger value="snacks" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Snacks</TabsTrigger>
            <TabsTrigger value="meals" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Meals</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-3">
              {itemsByCategory.map(item => (
                <Card key={item.id} className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] backdrop-blur-sm overflow-hidden flex">
                  <div className="w-24 h-24 bg-black/40 flex items-center justify-center border-r border-white/5 shrink-0">
                    <Coffee className="w-8 h-8 text-white/20" />
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm leading-tight">{item.name}</h3>
                      {item.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{item.description}</p>}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono font-bold text-green-400">₱{item.price.toFixed(2)}</span>
                      
                      {cart[item.id] ? (
                        <div className="flex items-center gap-2 bg-black/40 rounded-full px-1 border border-white/10">
                          <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-white"><Minus className="w-3 h-3" /></button>
                          <span className="text-xs font-bold w-4 text-center">{cart[item.id].quantity}</span>
                          <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center text-primary"><Plus className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <Button size="sm" className="h-7 px-3 text-xs bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30" onClick={() => addToCart(item)}>
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {itemsByCategory.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No items in this category.</div>
              )}
            </div>
          )}
        </Tabs>

        {/* Floating Cart */}
        {totalItems > 0 && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-40">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button className="w-full h-14 rounded-xl bg-primary text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center justify-between px-6">
                  <div className="flex items-center gap-2">
                    <div className="bg-black/20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      {totalItems}
                    </div>
                    <span className="font-medium">View Cart</span>
                  </div>
                  <span className="font-mono font-bold">₱{totalPrice.toFixed(2)}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] bg-[#07070D] border-t-white/10 rounded-t-2xl sm:max-w-md sm:mx-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle className="font-display">Your Order</SheetTitle>
                </SheetHeader>
                
                <ScrollArea className="flex-1 -mx-6 px-6 h-[calc(100%-150px)]">
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/5">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <div className="font-mono text-xs text-green-400 mt-1">₱{item.price.toFixed(2)}</div>
                        </div>
                        <div className="flex items-center gap-3 bg-black/40 rounded-full px-2 py-1 border border-white/10">
                          <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-white"><Minus className="w-4 h-4" /></button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => addToCart(item as any)} className="w-6 h-6 flex items-center justify-center text-primary"><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="absolute bottom-0 left-0 w-full p-6 bg-[#07070D] border-t border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground uppercase tracking-wider text-sm">Total</span>
                    <span className="text-2xl font-bold font-mono text-green-400">₱{totalPrice.toFixed(2)}</span>
                  </div>
                  <Button 
                    className="w-full h-12 text-lg shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                    onClick={handleCheckout}
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Confirm Order
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </PlayerLayout>
  );
}

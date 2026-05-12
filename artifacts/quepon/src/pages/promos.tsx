import { useListPromos, useListAnnouncements } from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Megaphone, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Promos() {
  const { data: promos, isLoading: loadingPromos } = useListPromos();
  const { data: announcements, isLoading: loadingAnns } = useListAnnouncements();

  const activePromos = promos?.filter(p => p.isActive)?.sort((a, b) => b.displayPriority - a.displayPriority) || [];
  const activeAnns = announcements?.filter(a => a.isActive) || [];

  const isLoading = loadingPromos || loadingAnns;

  return (
    <PlayerLayout>
      <div className="space-y-8 pt-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Updates</h1>
          <p className="text-muted-foreground text-sm">Promos & Announcements</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {activeAnns.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-yellow-400" /> Announcements
                </h2>
                <div className="space-y-3">
                  {activeAnns.map(ann => (
                    <Card key={ann.id} className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] backdrop-blur-sm border-l-4 border-l-yellow-400">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold">{ann.title}</h3>
                          <Badge variant="outline" className="border-yellow-400/50 text-yellow-400 uppercase text-[10px]">
                            {ann.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{ann.body}</p>
                        <div className="mt-3 text-[10px] text-muted-foreground/50 uppercase">
                          Posted {format(new Date(ann.createdAt), 'MMM d, yyyy')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" /> Promos
              </h2>
              {activePromos.length > 0 ? (
                <div className="space-y-3">
                  {activePromos.map(promo => (
                    <Card key={promo.id} className="bg-gradient-to-br from-primary/10 to-transparent border-[rgba(124,58,237,0.2)] backdrop-blur-sm">
                      <CardContent className="p-5">
                        <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 mb-3 uppercase tracking-wider text-[10px]">
                          {promo.tag}
                        </Badge>
                        <h3 className="text-xl font-bold mb-2 tracking-tight">{promo.title}</h3>
                        <p className="text-sm text-white/70 leading-relaxed mb-4">{promo.description}</p>
                        {(promo.startsAt || promo.endsAt) && (
                          <div className="text-[11px] text-primary/60 font-mono bg-black/20 p-2 rounded border border-white/5 inline-block">
                            {promo.startsAt && format(new Date(promo.startsAt), 'MMM d')} 
                            {promo.endsAt && ` - ${format(new Date(promo.endsAt), 'MMM d')}`}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.05)]">
                  No active promos at the moment.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PlayerLayout>
  );
}

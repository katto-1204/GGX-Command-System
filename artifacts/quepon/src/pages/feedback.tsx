import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubmitFeedback } from "@workspace/api-client-react";
import { PlayerLayout } from "@/components/layout/player-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare } from "lucide-react";

const feedbackSchema = z.object({
  category: z.string().min(1, "Category is required"),
  message: z.string().min(5, "Message must be at least 5 characters"),
  relatedPcId: z.string().optional(),
  isAnonymous: z.boolean().default(false)
});

export default function Feedback() {
  const { toast } = useToast();
  const submitFeedbackMutation = useSubmitFeedback();

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: "general",
      message: "",
      isAnonymous: false
    }
  });

  const onSubmit = (values: z.infer<typeof feedbackSchema>) => {
    submitFeedbackMutation.mutate({
      data: {
        category: values.category,
        message: values.message,
        isAnonymous: values.isAnonymous,
        relatedPcId: values.relatedPcId || null
      }
    }, {
      onSuccess: () => {
        toast({ title: "Feedback submitted. Thank you!" });
        form.reset();
      },
      onError: (err: any) => {
        toast({ title: "Failed to submit", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <PlayerLayout>
      <div className="space-y-6 pt-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Feedback</h1>
          <p className="text-muted-foreground text-sm">Tell us how we're doing</p>
        </div>

        <Card className="bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] backdrop-blur-sm">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-black/20 border-white/10">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="issue">Hardware/Software Issue</SelectItem>
                          <SelectItem value="suggestion">Suggestion</SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What's on your mind?" 
                          className="min-h-[120px] bg-black/20 border-white/10 resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relatedPcId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PC Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. PC-01" {...field} className="bg-black/20 border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAnonymous"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Submit Anonymously</FormLabel>
                        <p className="text-xs text-muted-foreground">Hide your username from staff</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg" 
                  disabled={submitFeedbackMutation.isPending}
                >
                  {submitFeedbackMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                  Send Feedback
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PlayerLayout>
  );
}

"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrnateCard } from "@/components/ui/premium-components";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Users, Wallet } from "lucide-react";
import { bulkGenerateEventFunds, getGroupedEvents } from "@/app/actions/fees";
import { useRouter } from "next/navigation";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerClose,
} from "@/components/ui/drawer";
import { EventDetailsDrawer } from "./EventDetailsDrawer";

export function EventsTab() {
    const [groupedEvents, setGroupedEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadEvents = async () => {
        setLoading(true);
        const res = await getGroupedEvents();
        if (res.success && res.data) {
            setGroupedEvents(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadEvents();
    }, []);

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <BulkEventDrawer onSuccess={loadEvents} />
            </div>

            {groupedEvents.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                    No active event funds found. Create one to get started.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedEvents.map((event) => (
                        <EventCard key={event.title} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}

function EventCard({ event }: { event: any }) {
    const totalAmount = event._sum.amount || 0;
    const collectedAmount = event._sum.paidAmount || 0;
    const progress = totalAmount > 0 ? (collectedAmount / totalAmount) * 100 : 0;
    const memberCount = event._count.id;

    return (
        <EventDetailsDrawer title={event.title}>
            <div className="cursor-pointer group">
                <OrnateCard className="h-full hover:shadow-xl transition-all hover:scale-[1.02] bg-white border-gold/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Wallet className="w-24 h-24" />
                    </div>

                    <div className="p-6 space-y-6 relative z-10">
                        <div className="space-y-2">
                            <Badge variant="outline" className="bg-gold/10 text-gold-dark border-gold/20 mb-2">Event Fund</Badge>
                            <h3 className="font-serif text-2xl font-bold text-primary-dark group-hover:text-gold-dark transition-colors leading-tight">
                                {event.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Users className="w-4 h-4 text-gold" />
                                <span className="font-medium">{memberCount} Members</span>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 space-y-3">
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Collected</span>
                                <span className="text-2xl font-bold text-primary-dark">
                                    ₹{collectedAmount.toLocaleString('en-IN')}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-medium text-gray-400">
                                    <span>Progress</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-gold to-gold-dark h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(184,134,11,0.3)]"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="text-right text-[10px] text-gray-400 uppercase tracking-wider">
                                    Target: ₹{totalAmount.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </div>
                </OrnateCard>
            </div>
        </EventDetailsDrawer>
    );
}

function BulkEventDrawer({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = () => {
        if (!title || !amount) return;

        startTransition(async () => {
            const res = await bulkGenerateEventFunds(title, parseInt(amount));
            if (res.success) {
                setOpen(false);
                setTitle("");
                setAmount("");
                onSuccess();
                router.refresh();
            } else {
                alert("Failed to generate event funds");
            }
        });
    };

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button className="bg-gold hover:bg-gold-dark text-black gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Plus className="w-4 h-4" />
                    Create Event Fund
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[auto] max-h-[85vh] rounded-t-3xl">
                <div className="mx-auto w-full max-w-sm bg-white/60 backdrop-blur-md pb-8">
                    <DrawerHeader className="text-center pt-8">
                        <DrawerTitle className="text-3xl font-serif text-primary-dark">Create Event Fund</DrawerTitle>
                        <DrawerDescription>
                            Generate a contribution request for all users.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-gray-500">Event Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Urs Mubaraka 1446H"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-white/50 border-gray-200 focus:border-gold h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-gray-500">Amount (₹)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400">₹</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="e.g. 500"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="bg-white/50 pl-7 border-gray-200 focus:border-gold h-11"
                                />
                            </div>
                        </div>

                        <Button onClick={handleSubmit} disabled={isPending || !title || !amount} className="w-full bg-gold hover:bg-gold-dark text-black h-12 text-lg font-medium shadow-lg shadow-gold/20 mt-4">
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                            Generate Requests
                        </Button>

                        <DrawerClose asChild>
                            <Button variant="ghost" className="w-full text-gray-400 hover:text-gray-600">Cancel</Button>
                        </DrawerClose>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

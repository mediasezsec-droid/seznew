"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrnateCard } from "@/components/ui/premium-components";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Calendar } from "lucide-react";
import { bulkGenerateEventFunds } from "@/app/actions/fees";
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

interface EventContribution {
    id: string;
    title: string;
    amount: number;
    paidAmount: number;
    status: "PENDING" | "PARTIAL" | "PAID";
    createdAt: Date;
    user: {
        name: string | null;
        username: string;
    };
}

export function EventsTab({ events }: { events: EventContribution[] }) {
    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <BulkEventDrawer />
            </div>

            <OrnateCard className="p-0 overflow-hidden border border-gold/20 shadow-2xl bg-white/90 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Event Title</th>
                                <th className="px-6 py-3">Member</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3 text-center">Status</th>
                                <th className="px-6 py-3 text-right">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {events.map((event) => (
                                <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-primary-dark">
                                        {event.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{event.user.name || event.user.username}</div>
                                        <div className="text-xs text-gray-500 font-mono">{event.user.username}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-medium">₹{event.amount}</div>
                                        {event.paidAmount > 0 && (
                                            <div className="text-xs text-green-600">Paid: ₹{event.paidAmount}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <StatusBadge status={event.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500">
                                        {new Date(event.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No event contributions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </OrnateCard>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "PAID":
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none">Paid</Badge>;
        case "PARTIAL":
            return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none">Partial</Badge>;
        default:
            return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 shadow-none">Pending</Badge>;
    }
}

function BulkEventDrawer() {
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
                router.refresh();
            } else {
                alert("Failed to generate event funds");
            }
        });
    };

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button className="bg-gold hover:bg-gold-dark text-black gap-2">
                    <Plus className="w-4 h-4" />
                    Create Event Fund
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle className="text-2xl font-serif text-primary-dark">Create Event Fund</DrawerTitle>
                        <DrawerDescription>
                            Generate a contribution request for all users for a specific event.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Event Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Urs Mubaraka 1446H"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (₹)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="e.g. 500"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <DrawerFooter>
                        <Button onClick={handleSubmit} disabled={isPending || !title || !amount} className="w-full bg-gold hover:bg-gold-dark text-black">
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Generate Requests
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

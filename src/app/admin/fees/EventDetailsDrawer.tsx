"use client";

import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Edit2, MoreVertical, Search, Check, X } from "lucide-react";
import { getEventDetails, updateBulkEvent, deleteBulkEvent, updateEventContribution } from "@/app/actions/fees";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EventDetailsDrawerProps {
    title: string;
    onClose?: () => void;
    children: React.ReactNode;
}

export function EventDetailsDrawer({ title, onClose, children }: EventDetailsDrawerProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    // Global Edit State
    const [isEditingGlobal, setIsEditingGlobal] = useState(false);
    const [editTitle, setEditTitle] = useState(title);
    const [editAmount, setEditAmount] = useState("");

    // Single Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [singleEditAmount, setSingleEditAmount] = useState("");

    const loadData = async () => {
        setLoading(true);
        const res = await getEventDetails(title);
        if (res.success && res.data) {
            setData(res.data);
            if (res.data.length > 0) {
                // Determine common amount for global edit placeholder
                // Just take the first one or try to find mode? First is simplest.
                setEditAmount(res.data[0].amount.toString());
            }
        }
        setLoading(false);
    };

    const handleGlobalUpdate = async () => {
        if (!editTitle || !editAmount) return;
        if (!confirm(`This will update the Title and Amount for ALL ${data.length} members. Continue?`)) return;

        console.log(`[EventDetails] Global update. Title: "${title}" -> "${editTitle}", Amount: ${editAmount}`);
        setLoading(true);
        const res = await updateBulkEvent(title, editTitle, parseFloat(editAmount));
        if (res.success) {
            console.log("[EventDetails] Update success.");
            toast.success("Event updated successfully");
            setOpen(false);
            router.refresh();
        } else {
            console.error("[EventDetails] Update failed:", res.error);
            toast.error(res.error || "Failed");
        }
        setLoading(false);
    };

    const handleGlobalDelete = async () => {
        if (!confirm(`Are you sure you want to DELETE this event for ALL ${data.length} members? This cannot be undone.`)) return;

        console.log(`[EventDetails] Global delete for "${title}"`);
        setLoading(true);
        const res = await deleteBulkEvent(title);
        if (res.success) {
            console.log("[EventDetails] Delete success.");
            toast.success("Event deleted successfully");
            setOpen(false);
            router.refresh();
        } else {
            console.error("[EventDetails] Delete failed:", res.error);
            toast.error(res.error || "Failed");
        }
        setLoading(false);
    };

    const handleSingleUpdate = async (id: string) => {
        setLoading(true);
        // We reuse updateEventContribution but we only want to change amount, keep title same?
        // Actually updateEventContribution requires title too.
        // Let's pass the current (or global) title.
        // Wait, fetching data gives us the title for that row. Use that.
        const row = data.find(d => d.id === id);
        if (!row) return;

        console.log(`[EventDetails] Single update. ID: ${id}, Amount: ${singleEditAmount}`);

        const res = await updateEventContribution(id, row.title, parseFloat(singleEditAmount));
        if (res.success) {
            toast.success("Updated");
            setEditingId(null);
            loadData(); // Reload to reflect changes locally if needed, though title is same.
            router.refresh();
        } else {
            console.error("[EventDetails] Single update failed:", res.error);
            toast.error("Failed");
        }
        setLoading(false);
    };

    const filteredData = data.filter(d =>
        d.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Drawer open={open} onOpenChange={(o) => {
            setOpen(o);
            if (o) loadData();
        }}>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent className="h-[95vh] rounded-t-3xl">
                <div className="mx-auto w-full max-w-3xl h-full flex flex-col bg-white/50 backdrop-blur-sm">
                    {/* Header */}
                    <div className="p-6 pb-2">
                        <div className="flex justify-between items-start mb-2">
                            <div className="space-y-1">
                                <DrawerTitle className="text-3xl font-serif text-primary-dark">
                                    {isEditingGlobal ? "Edit Event" : title}
                                </DrawerTitle>
                                <DrawerDescription className="text-base">
                                    {data.length} Members Assigned
                                </DrawerDescription>
                            </div>

                            {!isEditingGlobal && (
                                <div className="flex gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setIsEditingGlobal(true)}>
                                                <Edit2 className="w-4 h-4 mr-2" /> Edit Global Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleGlobalDelete} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete Event
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <DrawerClose asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8"><X className="w-4 h-4" /></Button>
                                    </DrawerClose>
                                </div>
                            )}
                        </div>

                        {/* Global Edit Mode */}
                        {isEditingGlobal && (
                            <div className="mt-4 p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-4 animate-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-amber-800 uppercase">Event Title</Label>
                                        <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="bg-white border-amber-200 focus:border-amber-400" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-amber-800 uppercase">Default Amount</Label>
                                        <Input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="bg-white border-amber-200 focus:border-amber-400" />
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end pt-2">
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditingGlobal(false)} className="hover:bg-amber-100/50">Cancel</Button>
                                    <Button size="sm" onClick={handleGlobalUpdate} className="bg-amber-900 text-white hover:bg-amber-800">Save Changes</Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search & Actions */}
                    <div className="px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-20 flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search members..."
                                className="pl-9 bg-white border-gray-200 focus:border-gold/50 transition-all rounded-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Member List */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {loading && data.length === 0 ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <div className="space-y-2">
                                {filteredData.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-all">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{item.user.name}</div>
                                            <div className="text-xs text-gray-500 font-mono">{item.user.username}</div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* Status Badge */}
                                            <Badge variant={item.status === 'PAID' ? 'default' : item.status === 'PARTIAL' ? 'secondary' : 'outline'}
                                                className={
                                                    item.status === 'PAID' ? "bg-green-100 text-green-700 hover:bg-green-100 border-none" :
                                                        item.status === 'PARTIAL' ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none" :
                                                            "text-gray-400 border-gray-200"
                                                }
                                            >
                                                {item.status}
                                            </Badge>

                                            {/* Amount / Edit */}
                                            <div className="w-32 text-right">
                                                {editingId === item.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <Input
                                                            type="number"
                                                            className="h-7 text-right px-1"
                                                            value={singleEditAmount}
                                                            onChange={e => setSingleEditAmount(e.target.value)}
                                                            autoFocus
                                                        />
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleSingleUpdate(item.id)}>
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={() => setEditingId(null)}>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="group flex items-center justify-end gap-2 cursor-pointer" onClick={() => {
                                                        setEditingId(item.id);
                                                        setSingleEditAmount(item.amount.toString());
                                                    }}>
                                                        <span className="font-semibold">₹{item.amount.toLocaleString('en-IN')}</span>
                                                        <Edit2 className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                )}
                                                {item.paidAmount > 0 && (
                                                    <div className="text-[10px] text-green-600">Paid: ₹{item.paidAmount}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

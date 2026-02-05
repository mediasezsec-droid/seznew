"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrnateCard } from "@/components/ui/premium-components";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Users, Wallet, Search as SearchIcon, Check, User } from "lucide-react";
import { bulkGenerateEventFunds, getGroupedEvents } from "@/app/actions/fees";
import { searchUsers } from "@/app/actions/users";
import { useRouter } from "next/navigation";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerClose,
} from "@/components/ui/drawer";
import { EventDetailsDrawer } from "./EventDetailsDrawer";
import { cn } from "@/lib/utils";

export function EventsTab() {
    const [groupedEvents, setGroupedEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadEvents = async () => {
        console.log("[EventsTab] Loading grouped events...");
        setLoading(true);
        const res = await getGroupedEvents();
        if (res.success && res.data) {
            console.log(`[EventsTab] Loaded ${res.data.length} event groups.`);
            setGroupedEvents(res.data);
        } else {
            console.warn("[EventsTab] Failed to load events or no data found.");
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
                <CreateEventDrawer onSuccess={loadEvents} />
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

function CreateEventDrawer({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Mode: ALL or USER
    const [mode, setMode] = useState<"ALL" | "USER">("ALL");
    const [targetUsers, setTargetUsers] = useState<any[]>([]);
    const [userSearch, setUserSearch] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (!userSearch) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearching(true);
            const res = await searchUsers(userSearch);
            if (res.success && res.data) {
                setSearchResults(res.data);
            }
            setSearching(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [userSearch]);

    const handleAddUser = (user: any) => {
        if (!targetUsers.find(u => u.id === user.id)) {
            setTargetUsers([...targetUsers, user]);
        }
        setSearchResults([]);
        setUserSearch("");
    };

    const handleRemoveUser = (userId: string) => {
        setTargetUsers(targetUsers.filter(u => u.id !== userId));
    };

    const handleSubmit = () => {
        if (!title || !amount) return;
        if (mode === "USER" && targetUsers.length === 0) return;

        console.log(`[CreateEvent] Initiating creation. Title: "${title}", Amount: ${amount}, Mode: ${mode}, TargetUsers: ${targetUsers.length}`);

        startTransition(async () => {
            const targetIds = mode === "USER" ? targetUsers.map(u => u.id) : undefined;
            const res = await bulkGenerateEventFunds(title, parseInt(amount), targetIds);

            if (res.success) {
                console.log("[CreateEvent] Success.");
                setOpen(false);
                setTitle("");
                setAmount("");
                setMode("ALL");
                setTargetUsers([]);
                setUserSearch("");
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
            <DrawerContent className="h-[auto] max-h-[90vh] rounded-t-3xl">
                <div className="mx-auto w-full max-w-sm bg-white/60 backdrop-blur-md pb-8">
                    <DrawerHeader className="text-center pt-8">
                        <DrawerTitle className="text-3xl font-serif text-primary-dark">Create Event Fund</DrawerTitle>
                        <DrawerDescription>
                            Create a contribution request for {mode === "ALL" ? "all members" : "specific members"}.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-6 space-y-6">

                        {/* Mode Selection */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                            <button
                                onClick={() => setMode("ALL")}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-md transition-all",
                                    mode === "ALL" ? "bg-white shadow-sm text-primary-dark" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                All Members
                            </button>
                            <button
                                onClick={() => setMode("USER")}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-md transition-all",
                                    mode === "USER" ? "bg-white shadow-sm text-primary-dark" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Specific Members
                            </button>
                        </div>

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

                        {/* User Selection */}
                        {mode === "USER" && (
                            <div className="space-y-3 relative">
                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Target Members ({targetUsers.length})</Label>

                                {/* Selected Users List */}
                                {targetUsers.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                        {targetUsers.map(u => (
                                            <div key={u.id} className="flex items-center gap-1 pl-2 pr-1 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-700 shadow-sm animate-in fade-in zoom-in duration-200">
                                                <span className="max-w-[100px] truncate">{u.name || u.username}</span>
                                                <button onClick={() => handleRemoveUser(u.id)} className="p-0.5 hover:bg-red-50 hover:text-red-500 rounded transition-colors">
                                                    <CreateEventDrawerIconX className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by name, ITS, or username..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="pl-9 bg-white/50 border-gray-200 focus:border-gold h-11"
                                    />
                                    {/* Dropdown Results */}
                                    {(searchResults.length > 0 || searching) && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 max-h-48 overflow-y-auto z-50">
                                            {searching && <div className="p-3 text-sm text-gray-400 text-center">Searching...</div>}
                                            {searchResults.map(user => {
                                                const isSelected = targetUsers.some(u => u.id === user.id);
                                                return (
                                                    <div
                                                        key={user.id}
                                                        className={cn(
                                                            "p-3 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center",
                                                            isSelected ? "bg-green-50/50" : "hover:bg-amber-50"
                                                        )}
                                                        onClick={() => !isSelected && handleAddUser(user)}
                                                    >
                                                        <div>
                                                            <div className="font-medium text-gray-900">{user.name || user.username}</div>
                                                            <div className="text-xs text-gray-400 flex gap-2">
                                                                <span>ITS: {user.its}</span>
                                                            </div>
                                                        </div>
                                                        {isSelected && <Check className="w-4 h-4 text-green-600" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {userSearch && !searching && searchResults.length === 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 p-3 text-sm text-gray-400 text-center z-50">
                                            No members found
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <Button onClick={handleSubmit} disabled={isPending || !title || !amount || (mode === "USER" && targetUsers.length === 0)} className="w-full bg-gold hover:bg-gold-dark text-black h-12 text-lg font-medium shadow-lg shadow-gold/20 mt-4">
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

// Icon helper
function CreateEventDrawerIconX({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}

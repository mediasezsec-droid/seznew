"use client";

import {
    Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, DrawerTrigger
} from "@/components/ui/drawer";
import { GoldenButton, OrnateCard } from "@/components/ui/premium-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone, CheckCircle, ScanLine, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PendingFee {
    id: string;
    month: number;
    year: number;
    amount: number;
    paidAmount: number;
}

interface PendingEvent {
    id: string;
    title: string;
    amount: number;
    paidAmount: number;
}

interface UnifiedPaymentDrawerProps {
    pendingFees: PendingFee[];
    pendingEvents: PendingEvent[];
    username?: string;
}

export function UnifiedPaymentDrawer({ pendingFees, pendingEvents, username }: UnifiedPaymentDrawerProps) {
    // Selection States
    const [selectedFeeIds, setSelectedFeeIds] = useState<Set<string>>(new Set());
    const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
    const [voluntaryAmount, setVoluntaryAmount] = useState<number>(0);

    // Derived State
    const selectedFees = pendingFees.filter(f => selectedFeeIds.has(f.id));
    const selectedEvents = pendingEvents.filter(e => selectedEventIds.has(e.id));

    const feesTotal = selectedFees.reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);
    const eventsTotal = selectedEvents.reduce((sum, e) => sum + (e.amount - e.paidAmount), 0);

    const totalAmount = feesTotal + eventsTotal + (voluntaryAmount || 0);

    // UPI Details
    const upiId = "dbjtsez@idfcbank";
    const payeeName = "SezNew Fees";
    const userLabel = username || "member";

    // Generate Note
    // Format: VC | [Items] | User
    // Items: "Jan'24, Feb'24, EventTitle"
    const feeItems = selectedFees.map(f => new Date(f.year, f.month).toLocaleString('default', { month: 'short' }) + "'" + f.year.toString().slice(2));
    const eventItems = selectedEvents.map(e => e.title.substring(0, 10)); // Truncate long titles
    const items = [...feeItems, ...eventItems].join(",");
    const noteItems = items ? items : "Voluntary";
    const note = `VC | ${noteItems} | ${userLabel}`;

    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount}&tn=${encodeURIComponent(note)}&cu=INR`;

    const toggleFee = (id: string) => {
        const next = new Set(selectedFeeIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedFeeIds(next);
    };

    const toggleEvent = (id: string) => {
        const next = new Set(selectedEventIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedEventIds(next);
    };

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <div className="w-full">
                    <GoldenButton className="w-full flex items-center justify-center gap-4 py-8 text-lg shadow-xl hover:shadow-gold/20 mb-8 border border-gold/40 bg-gradient-to-r from-gold via-yellow-400 to-gold text-black">
                        <ScanLine className="w-8 h-8" />
                        <span className="flex flex-col items-start leading-none gap-1">
                            <span className="font-serif font-bold text-xl tracking-wide">Scan & Pay</span>
                            <span className="text-[10px] font-bold opacity-75 uppercase tracking-[0.2em]">Make Contribution</span>
                        </span>
                    </GoldenButton>
                </div>
            </DrawerTrigger>
            <DrawerContent className="h-[95vh] rounded-t-3xl">
                <div className="mx-auto w-full max-w-lg h-full bg-white/60 backdrop-blur-md pb-8 flex flex-col">
                    <DrawerHeader className="text-center pt-8 px-6">
                        <DrawerTitle className="text-3xl text-primary-dark font-serif font-bold">Make Contribution</DrawerTitle>
                        <DrawerDescription className="text-base font-medium text-gray-500">
                            Select pending pending items or add a voluntary amount.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-6 flex-1 overflow-y-auto space-y-6 scrollbar-hide">
                        {/* Pending Items Selection */}
                        {(pendingFees.length > 0 || pendingEvents.length > 0) && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Select Pending Items</h3>
                                <div className="space-y-3">
                                    {pendingFees.map(fee => {
                                        const due = fee.amount - fee.paidAmount;
                                        return (
                                            <div key={fee.id} className={cn("flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200", selectedFeeIds.has(fee.id) ? "bg-amber-50 border-gold/50 shadow-sm" : "bg-white border-transparent hover:border-gray-200 shadow-sm")}>
                                                <div className="flex items-center gap-4">
                                                    <Checkbox
                                                        id={fee.id}
                                                        checked={selectedFeeIds.has(fee.id)}
                                                        onCheckedChange={() => toggleFee(fee.id)}
                                                        className="h-5 w-5 data-[state=checked]:bg-gold data-[state=checked]:border-gold border-2 border-gray-300"
                                                    />
                                                    <Label htmlFor={fee.id} className="cursor-pointer space-y-0.5">
                                                        <div className="font-bold text-gray-900 text-base">
                                                            {new Date(fee.year, fee.month).toLocaleString('default', { month: 'long' })} {fee.year}
                                                        </div>
                                                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Monthly Contribution</div>
                                                    </Label>
                                                </div>
                                                <div className="font-serif font-bold text-lg text-primary-dark">₹{due}</div>
                                            </div>
                                        );
                                    })}

                                    {pendingEvents.map(event => {
                                        const due = event.amount - event.paidAmount;
                                        return (
                                            <div key={event.id} className={cn("flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200", selectedEventIds.has(event.id) ? "bg-amber-50 border-gold/50 shadow-sm" : "bg-white border-transparent hover:border-gray-200 shadow-sm")}>
                                                <div className="flex items-center gap-4">
                                                    <Checkbox
                                                        id={event.id}
                                                        checked={selectedEventIds.has(event.id)}
                                                        onCheckedChange={() => toggleEvent(event.id)}
                                                        className="h-5 w-5 data-[state=checked]:bg-gold data-[state=checked]:border-gold border-2 border-gray-300"
                                                    />
                                                    <Label htmlFor={event.id} className="cursor-pointer space-y-0.5">
                                                        <div className="font-bold text-gray-900 text-base">{event.title}</div>
                                                        <div className="text-xs font-medium text-gold-dark uppercase tracking-wide flex items-center gap-1">
                                                            <Wallet className="w-3 h-3" /> Event Fund
                                                        </div>
                                                    </Label>
                                                </div>
                                                <div className="font-serif font-bold text-lg text-primary-dark">₹{due}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Voluntary Amount */}
                        <div className="space-y-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-gold" />
                                Add Extra / Voluntary Amount
                            </h3>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xl">₹</span>
                                <Input
                                    type="number"
                                    value={voluntaryAmount || ""}
                                    onChange={(e) => setVoluntaryAmount(parseFloat(e.target.value))}
                                    placeholder="0"
                                    className="pl-10 h-14 text-2xl font-bold border-gray-200 focus:border-gold focus:ring-4 focus:ring-gold/10 bg-gray-50 rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Total & QR */}
                        {totalAmount > 0 ? (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6 pt-6 border-t border-dashed border-gray-300/50">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-lg font-serif font-bold text-gray-500">Total Payable</span>
                                    <span className="text-4xl font-serif font-bold text-primary-dark">₹{totalAmount.toLocaleString('en-IN')}</span>
                                </div>

                                <OrnateCard className="p-8 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-6 border-0 ring-1 ring-black/5">
                                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                        <QRCodeSVG
                                            value={upiUrl}
                                            size={220}
                                            level="Q"
                                            includeMargin={true}
                                            imageSettings={{
                                                src: "/logo.png", // Assuming logo exists, else it will be ignored or broken image icon if not handled. Removed to be safe or keep consistent with previous code which didn't have image.
                                                height: 40,
                                                width: 40,
                                                excavate: true,
                                            }}
                                        />
                                    </div>
                                    <div className="text-xs text-center font-mono bg-gray-50 px-3 py-1.5 rounded-full text-gray-500 border border-gray-100">
                                        {upiId}
                                    </div>
                                </OrnateCard>

                                <div className="space-y-4 px-2 pb-6">
                                    <a href={upiUrl} className="block w-full">
                                        <div className="w-full flex items-center justify-center gap-3 bg-primary-dark text-white h-14 rounded-xl font-bold text-lg shadow-xl shadow-primary-dark/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                            <Smartphone className="w-5 h-5" />
                                            Pay via UPI App
                                        </div>
                                    </a>
                                    <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-medium">
                                        Tap above to open GPay, PhonePe, Paytm
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                Select pending items or enter an amount to pay.
                            </div>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

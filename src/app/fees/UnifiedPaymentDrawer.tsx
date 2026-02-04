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
                    <GoldenButton className="w-full flex items-center justify-center gap-2 py-6 text-lg shadow-xl hover:shadow-gold/20 mb-8">
                        <ScanLine className="w-6 h-6" />
                        <span className="flex flex-col items-start leading-none">
                            <span className="font-bold">Scan & Pay</span>
                            <span className="text-[10px] font-normal opacity-80 uppercase tracking-widest mt-1">Make a Contribution</span>
                        </span>
                    </GoldenButton>
                </div>
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh]">
                <div className="mx-auto w-full max-w-sm pb-8 overflow-y-auto">
                    <DrawerHeader className="text-center">
                        <DrawerTitle className="text-2xl text-primary-dark font-serif">Make Contribution</DrawerTitle>
                        <DrawerDescription>
                            Select pending pending items or add a voluntary amount.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 space-y-6">
                        {/* Pending Items Selection */}
                        {(pendingFees.length > 0 || pendingEvents.length > 0) && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Pending Items</h3>
                                <div className="space-y-2">
                                    {pendingFees.map(fee => {
                                        const due = fee.amount - fee.paidAmount;
                                        return (
                                            <div key={fee.id} className={cn("flex items-center justify-between p-3 rounded-lg border transition-colors", selectedFeeIds.has(fee.id) ? "bg-gold/10 border-gold/40" : "bg-gray-50 border-gray-100")}>
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        id={fee.id}
                                                        checked={selectedFeeIds.has(fee.id)}
                                                        onCheckedChange={() => toggleFee(fee.id)}
                                                        className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                                                    />
                                                    <Label htmlFor={fee.id} className="cursor-pointer">
                                                        <div className="font-medium text-gray-900">
                                                            {new Date(fee.year, fee.month).toLocaleString('default', { month: 'long' })} {fee.year}
                                                        </div>
                                                        <div className="text-xs text-gray-500">Monthly Contribution</div>
                                                    </Label>
                                                </div>
                                                <div className="font-bold text-gray-700">₹{due}</div>
                                            </div>
                                        );
                                    })}

                                    {pendingEvents.map(event => {
                                        const due = event.amount - event.paidAmount;
                                        return (
                                            <div key={event.id} className={cn("flex items-center justify-between p-3 rounded-lg border transition-colors", selectedEventIds.has(event.id) ? "bg-gold/10 border-gold/40" : "bg-gray-50 border-gray-100")}>
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        id={event.id}
                                                        checked={selectedEventIds.has(event.id)}
                                                        onCheckedChange={() => toggleEvent(event.id)}
                                                        className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                                                    />
                                                    <Label htmlFor={event.id} className="cursor-pointer">
                                                        <div className="font-medium text-gray-900">{event.title}</div>
                                                        <div className="text-xs text-gray-500">Event Fund</div>
                                                    </Label>
                                                </div>
                                                <div className="font-bold text-gray-700">₹{due}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Voluntary Amount */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Wallet className="w-3 h-3" />
                                Add Extra Amount
                            </h3>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                <Input
                                    type="number"
                                    value={voluntaryAmount || ""}
                                    onChange={(e) => setVoluntaryAmount(parseFloat(e.target.value))}
                                    placeholder="0"
                                    className="pl-8 text-lg font-bold border-gold/30 focus-visible:ring-gold"
                                />
                            </div>
                        </div>

                        {/* Total & QR */}
                        {totalAmount > 0 ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pt-4 border-t border-dashed border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-serif font-bold text-primary-dark">Total Payable</span>
                                    <span className="text-2xl font-bold text-green-700">₹{totalAmount}</span>
                                </div>

                                <OrnateCard className="p-6 bg-white shadow-inner flex flex-col items-center justify-center gap-4">
                                    <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                                        <QRCodeSVG
                                            value={upiUrl}
                                            size={200}
                                            level="M"
                                            includeMargin={true}
                                        />
                                    </div>
                                    <div className="text-xs text-center text-gray-500 font-mono break-all max-w-[200px]">
                                        {upiId}
                                    </div>
                                </OrnateCard>

                                <div className="space-y-3">
                                    <a href={upiUrl} className="block w-full">
                                        <GoldenButton className="w-full flex items-center justify-center gap-2">
                                            <Smartphone className="w-4 h-4" />
                                            Pay with UPI
                                        </GoldenButton>
                                    </a>
                                    <p className="text-xs text-center text-gray-400">
                                        Tap above to open Google Pay, PhonePe, or Paytm
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                Select pending items or enter an amount to pay.
                            </div>
                        )}
                    </div>

                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

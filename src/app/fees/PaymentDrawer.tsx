"use client";

import {
    Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, DrawerTrigger
} from "@/components/ui/drawer";
import { GoldenButton, OrnateCard } from "@/components/ui/premium-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Smartphone, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface PaymentDrawerProps {
    amount: number;
    month: number;
    year: number;
    children: React.ReactNode;
    forceNote?: string;
    isFixed?: boolean;
}

export function PaymentDrawer({ amount, month, year, username, children, forceNote, isFixed }: PaymentDrawerProps & { username?: string }) {
    // TODO: Move to Env or SiteConfig if needed, but hardcoded as per request
    const upiId = "dbjtsez@idfcbank";
    const payeeName = "SezNew Fees";
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

    // VC | Month year | username
    const userLabel = username || "member";
    const defaultNote = `VC | ${monthName} ${year} | ${userLabel}`;
    const note = forceNote || defaultNote;

    const [payAmount, setPayAmount] = useState(amount);

    // Update payAmount if prop changes (e.g. different month selected)
    // But allow user override
    useEffect(() => {
        setPayAmount(amount);
    }, [amount]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val >= 0) {
            setPayAmount(val);
        }
    };

    // URI Encoding
    // Encode with current payAmount
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${payAmount}&tn=${encodeURIComponent(note)}&cu=INR`;

    return (
        <Drawer>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent className="h-[auto] max-h-[90vh] rounded-t-3xl">
                <div className="mx-auto w-full max-w-sm pb-8 bg-white/60 backdrop-blur-md">
                    <DrawerHeader className="text-center pt-8 px-6">
                        <DrawerTitle className="text-3xl text-primary-dark font-serif font-bold">Voluntary Contribution</DrawerTitle>
                        <DrawerDescription className="text-base font-medium text-gray-500">
                            Scan QR or use UPI apps. Adjust amount if needed.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-6 flex flex-col items-center gap-6">
                        {isFixed ? (
                            <div className="space-y-8 flex flex-col items-center w-full">
                                <div className="text-center space-y-1">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount Payable</h3>
                                    <div className="text-4xl font-serif text-primary-dark font-bold">₹{amount.toLocaleString('en-IN')}</div>
                                </div>

                                <OrnateCard className="p-8 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-6 border-0 ring-1 ring-black/5 w-full">
                                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                        <QRCodeSVG
                                            value={upiUrl}
                                            size={200}
                                            level="Q"
                                            includeMargin={true}
                                            imageSettings={{
                                                src: "/logo.png",
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

                                <div className="w-full space-y-4">
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
                            <>
                                <div className="w-full space-y-3">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block text-center">Enter Amount (INR)</label>
                                    <div className="relative max-w-[240px] mx-auto">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xl">₹</span>
                                        <Input
                                            type="number"
                                            value={payAmount}
                                            onChange={handleAmountChange}
                                            className="pl-10 h-16 text-3xl font-bold border-gray-200 focus:border-gold focus:ring-4 focus:ring-gold/10 bg-gray-50 rounded-2xl text-center"
                                        />
                                    </div>
                                </div>

                                {payAmount > 0 ? (
                                    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <OrnateCard className="p-8 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-6 border-0 ring-1 ring-black/5">
                                            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                                <QRCodeSVG
                                                    value={upiUrl}
                                                    size={200}
                                                    level="Q"
                                                    includeMargin={true}
                                                    imageSettings={{
                                                        src: "/logo.png",
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

                                        <div className="w-full space-y-4">
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
                                    <div className="text-center space-y-4 py-8 w-full bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-gray-300 shadow-sm">
                                            <QrCode className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-gray-900">Enter Amount</h3>
                                            <p className="text-sm text-gray-500">
                                                Please enter a valid amount to generate QR.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

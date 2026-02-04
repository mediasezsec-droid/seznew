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
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm pb-8">
                    <DrawerHeader className="text-center">
                        <DrawerTitle className="text-2xl text-primary-dark font-serif">Voluntary Contribution</DrawerTitle>
                        <DrawerDescription>
                            Scan QR or use the button below. You can adjust the amount if needed.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 flex flex-col items-center gap-6">
                        {isFixed ? (
                            <div className="space-y-6 flex flex-col items-center">
                                <div className="text-center">
                                    <h3 className="font-bold text-gray-500 uppercase tracking-wider mb-1">Scan to Pay</h3>
                                    <div className="text-3xl font-serif text-primary-dark font-bold">₹{amount}</div>
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

                                <div className="w-full space-y-3">
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
                            <>
                                <div className="w-full max-w-[200px] space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block text-center">Amount (INR)</label>
                                    <Input
                                        type="number"
                                        value={payAmount}
                                        onChange={handleAmountChange}
                                        className="text-center text-2xl font-bold h-14 border-gold/30 focus-visible:ring-gold"
                                    />
                                </div>

                                {payAmount > 0 ? (
                                    <>
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

                                        <div className="w-full space-y-3">
                                            <a href={upiUrl} className="block w-full">
                                                <GoldenButton className="w-full flex items-center justify-center gap-2">
                                                    <Smartphone className="w-4 h-4" />
                                                    Pay using UPI App
                                                </GoldenButton>
                                            </a>
                                            <p className="text-xs text-center text-gray-400">
                                                Tap above to open Google Pay, PhonePe, or Paytm
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center space-y-4 py-8">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                                            <CheckCircle className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-gray-900">Zero Contribution</h3>
                                            <p className="text-sm text-gray-500">
                                                There are no pending contributions for this month.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
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

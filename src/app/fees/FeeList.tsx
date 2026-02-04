"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrnateCard } from "@/components/ui/premium-components";
import { format } from "date-fns";
import { CheckCircle2, Clock, AlertCircle, CreditCard } from "lucide-react";

interface FeeRecord {
    id: string;
    month: number;
    year: number;
    amount: number;
    paidAmount: number;
    status: "PENDING" | "PARTIAL" | "PAID";
    updatedAt: Date;
}

export function FeeList({ fees, username }: { fees: FeeRecord[]; username?: string }) {
    return (
        <div className="space-y-4">
            {fees.length === 0 ? (
                <OrnateCard className="p-8 text-center text-gray-500">
                    No contribution records found.
                </OrnateCard>
            ) : (
                fees.map((fee) => (
                    <FeeCard key={fee.id} fee={fee} username={username} />
                ))
            )}
        </div>
    );
}


import { QRCodeSVG } from "qrcode.react";
import { GoldenButton } from "@/components/ui/premium-components";
import { Smartphone } from "lucide-react";

function FeeCard({ fee, username }: { fee: FeeRecord; username?: string }) {
    const monthName = new Date(fee.year, fee.month).toLocaleString('default', { month: 'long' });
    const isPaid = fee.status === "PAID";
    const dueAmount = fee.amount - fee.paidAmount;

    // UPI Details
    const upiId = "dbjtsez@idfcbank";
    const payeeName = "SezNew Fees";
    const userLabel = username || "member";
    const noteFormatted = `VC | ${monthName} ${fee.year} | ${userLabel}`;
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${dueAmount}&tn=${encodeURIComponent(noteFormatted)}&cu=INR`;

    return (
        <OrnateCard className="p-0 overflow-hidden flex flex-col transition-all duration-300">
            {/* Header / Info Section */}
            <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/50 border-b border-gray-100/50">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-primary-dark">
                            {monthName} {fee.year}
                        </h3>
                        <StatusBadge status={fee.status} />
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-4">
                        <span>Due: <span className="font-bold text-gray-900">₹{fee.amount}</span></span>
                    </div>
                </div>

                {isPaid && (
                    <div className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-4 py-2 rounded-full border border-green-200 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Paid
                    </div>
                )}
            </div>

            {/* Upfront Payment Section (Only if Pending) */}
            {!isPaid && (
                <div className="p-5 bg-gradient-to-b from-gray-50/50 to-gray-50/10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

                        {/* QR Code Area */}
                        <div className="flex items-center gap-6 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <QRCodeSVG
                                value={upiUrl}
                                size={100}
                                level="M"
                                includeMargin={false}
                            />
                            <div className="space-y-1 text-left">
                                <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Scan to Pay</p>
                                <p className="text-xl font-serif font-bold text-primary-dark">₹{dueAmount}</p>
                                <p className="text-[10px] text-gray-400 font-mono">{upiId}</p>
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="flex-1 w-full sm:w-auto flex flex-col items-center sm:items-end justify-center gap-2">
                            <a href={upiUrl} className="block w-full sm:w-auto">
                                <GoldenButton className="w-full sm:w-auto px-8 py-6 flex items-center justify-center gap-3">
                                    <Smartphone className="w-5 h-5" />
                                    <span className="text-base">Pay with UPI</span>
                                </GoldenButton>
                            </a>
                            <p className="text-xs text-gray-400 text-center sm:text-right">
                                Tap to open GPay / PhonePe / Paytm
                            </p>
                        </div>

                    </div>
                </div>
            )}
        </OrnateCard>
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

"use client";

import { useState } from "react";
import { PaymentDrawer } from "./PaymentDrawer";
import { GoldenButton } from "@/components/ui/premium-components";
import { CreditCard, ScanLine } from "lucide-react";

export function CustomPaymentButton({ username }: { username?: string }) {
    const currentDate = new Date();
    // Default to current month/year for context, but amount can be custom
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    return (
        <div className="w-full">
            <PaymentDrawer amount={0} month={month} year={year} username={username}>
                <GoldenButton className="w-full flex items-center justify-center gap-2 py-6 text-lg shadow-xl hover:shadow-gold/20 mb-8">
                    <ScanLine className="w-6 h-6" />
                    <span className="flex flex-col items-start leading-none">
                        <span className="font-bold">Scan & Pay</span>
                        <span className="text-[10px] font-normal opacity-80 uppercase tracking-widest mt-1">Make a Contribution</span>
                    </span>
                </GoldenButton>
            </PaymentDrawer>
        </div>
    );
}

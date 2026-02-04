"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoldenButton } from "@/components/ui/premium-components";
import { BulkFeeDrawer } from "./BulkFeeDrawer";
import { Sparkles } from "lucide-react";

export function FeeControls({ month, year }: { month: number; year: number }) {
    const router = useRouter();

    const handleFilterChange = (key: 'month' | 'year', value: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set(key, value);
        router.push(`?${params.toString()}`);
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex gap-2 w-full md:w-auto">
                <Select
                    value={month.toString()}
                    onValueChange={(v) => handleFilterChange('month', v)}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map((m, i) => (
                            <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={year.toString()}
                    onValueChange={(v) => handleFilterChange('year', v)}
                >
                    <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((y) => (
                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <BulkFeeDrawer month={month} year={year}>
                <GoldenButton className="w-full md:w-auto flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Bulk Generate
                </GoldenButton>
            </BulkFeeDrawer>
        </div>
    );
}

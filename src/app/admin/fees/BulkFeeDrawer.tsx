"use client";

import { useState } from "react";
import {
    Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, DrawerTrigger
} from "@/components/ui/drawer";
import { GoldenButton } from "@/components/ui/premium-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bulkGenerateFees } from "@/app/actions/fees";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function BulkFeeDrawer({
    month,
    year,
    children
}: {
    month: number;
    year: number;
    children: React.ReactNode
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState<string>(""); // specialized amount for this bulk run
    const router = useRouter();

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // Parse amount if provided
            const overrideAmount = amount ? parseInt(amount) : undefined;
            const result = await bulkGenerateFees(month, year, overrideAmount);

            if (result.success) {
                toast.success(`Generated ${result.count} fee records`);
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to generate fees");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent className="h-[auto] max-h-[85vh] rounded-t-3xl">
                <div className="mx-auto w-full max-w-sm bg-white/60 backdrop-blur-md pb-8">
                    <DrawerHeader className="text-center pt-8">
                        <DrawerTitle className="text-3xl font-serif text-primary-dark">Bulk Generate Fees</DrawerTitle>
                        <DrawerDescription>
                            Create fee records for <strong>{monthName} {year}</strong>.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-6 flex flex-col gap-6">
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/60 shadow-sm text-sm text-amber-900 leading-relaxed">
                            This process will scan all users. If a fee record already exists for this month, it will be skipped.
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Universal Fee Amount (Optional)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-400">₹</span>
                                <Input
                                    type="number"
                                    placeholder="e.g. 200"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="bg-white/50 pl-7 h-11 border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold/20"
                                />
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium">
                                Leave blank to use each user's default configuration.
                            </p>
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full bg-gold hover:bg-gold-dark text-black h-12 text-lg font-medium shadow-lg shadow-gold/20 mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" /> Generating...
                                </span>
                            ) : (
                                "Confirm Generate"
                            )}
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

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
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle className="text-2xl text-primary-dark">Bulk Generate Fees</DrawerTitle>
                        <DrawerDescription>
                            Create fee records for <strong>{monthName} {year}</strong>.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 flex flex-col gap-4">
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-sm text-amber-800">
                            This process will scan all users. If a fee record already exists for this month, it will be skipped.
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fee Amount for Everyone (Optional)</label>
                            <Input
                                type="number"
                                placeholder="e.g. 200"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <p className="text-xs text-gray-500">
                                If left blank, individual user defaults will be used.
                            </p>
                        </div>
                    </div>

                    <DrawerFooter>
                        <GoldenButton
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                                </span>
                            ) : (
                                "Confirm Generate"
                            )}
                        </GoldenButton>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

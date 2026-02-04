"use client";

import { useState } from "react";
import {
    Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, DrawerTrigger
} from "@/components/ui/drawer";
import { GoldenButton } from "@/components/ui/premium-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertFeeConfig, createFeeRecord, updateFeeRecord } from "@/app/actions/fees";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditFeeDrawerProps {
    userId: string;
    userName: string;
    month: number;
    year: number;
    initialConfigAmount: number;
    initialRecord: {
        id: string;
        amount: number;
        paidAmount: number;
        status: "PENDING" | "PARTIAL" | "PAID";
    } | null;
    children: React.ReactNode;
}

export function EditFeeDrawer({
    userId, userName, month, year, initialConfigAmount, initialRecord, children
}: EditFeeDrawerProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // State for Config
    const [configAmount, setConfigAmount] = useState(initialConfigAmount);

    // State for Record
    const [recordAmount, setRecordAmount] = useState(initialRecord?.amount || initialConfigAmount || 0);
    const [paidAmount, setPaidAmount] = useState(initialRecord?.paidAmount || 0);
    const [status, setStatus] = useState<"PENDING" | "PARTIAL" | "PAID">(initialRecord?.status || "PENDING");

    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

    const handleSaveConfig = async () => {
        setLoading(true);
        try {
            const result = await upsertFeeConfig(userId, configAmount);
            if (result.success) {
                toast.success("Default fee updated");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update config");
            }
        } catch (error) {
            toast.error("Error updating config");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRecord = async () => {
        setLoading(true);
        try {
            if (initialRecord) {
                // Update existing
                const result = await updateFeeRecord(initialRecord.id, {
                    amount: recordAmount,
                    paidAmount,
                    status
                });
                if (result.success) {
                    toast.success("Fee record updated");
                    setOpen(false);
                    router.refresh();
                } else {
                    toast.error(result.error || "Failed to update record");
                }
            } else {
                // Create new
                const result = await createFeeRecord(userId, month, year, recordAmount);
                if (result.success) {
                    toast.success("Fee record created");
                    // If we created a record, we might want to immediately set paid amount if user entered it
                    // But createFeeRecord only takes amount. 
                    // To handle Paid/Partial on creation, we'd need createFeeRecord to accept more args 
                    // or just update it immediately. For simplicity, create just sets Pending amount.
                    // If user entered paid amount, we might need a second call, but let's encourage them to use "Record Payment" instead?
                    // Or let's just make createFeeRecord accept all fields. For now, basic create.

                    setOpen(false);
                    router.refresh();
                } else {
                    toast.error(result.error || "Failed to create record");
                }
            }
        } catch (error) {
            toast.error("Error saving record");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-md">
                    <DrawerHeader>
                        <DrawerTitle className="text-xl text-primary-dark">Manage Fees: {userName}</DrawerTitle>
                        <DrawerDescription>
                            Configure default fees or edit the record for {monthName} {year}.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4">
                        <Tabs defaultValue="record">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="record">{monthName} Fee</TabsTrigger>
                                <TabsTrigger value="config">Default Config</TabsTrigger>
                            </TabsList>

                            {/* Current Month Record */}
                            <TabsContent value="record" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Due Amount</Label>
                                    <Input
                                        type="number"
                                        value={recordAmount}
                                        onChange={(e) => setRecordAmount(Number(e.target.value))}
                                    />
                                </div>

                                {initialRecord && (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Paid Amount</Label>
                                            <Input
                                                type="number"
                                                value={paidAmount}
                                                onChange={(e) => setPaidAmount(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PENDING">Pending</SelectItem>
                                                    <SelectItem value="PARTIAL">Partial</SelectItem>
                                                    <SelectItem value="PAID">Paid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}

                                <GoldenButton onClick={handleSaveRecord} disabled={loading} className="w-full mt-4">
                                    {loading ? <Loader2 className="animate-spin" /> : "Save Record"}
                                </GoldenButton>
                            </TabsContent>

                            {/* Default Config */}
                            <TabsContent value="config" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Default Monthly Fee</Label>
                                    <Input
                                        type="number"
                                        value={configAmount}
                                        onChange={(e) => setConfigAmount(Number(e.target.value))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This amount will be used when bulk generating fees for future months.
                                    </p>
                                </div>
                                <Button onClick={handleSaveConfig} disabled={loading} className="w-full mt-4">
                                    {loading ? <Loader2 className="animate-spin" /> : "Update Configuration"}
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="ghost">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

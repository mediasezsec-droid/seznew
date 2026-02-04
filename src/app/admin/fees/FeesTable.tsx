"use client";

import { EditFeeDrawer } from "./EditFeeDrawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Edit2, CheckCircle2, Clock } from "lucide-react";

interface FeeData {
    userId: string;
    name: string;
    username: string;
    configAmount: number;
    record: {
        id: string;
        amount: number;
        paidAmount: number;
        status: "PENDING" | "PARTIAL" | "PAID";
    } | null;
    isGenerated: boolean;
}

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function FeesTable({
    data,
    month,
    year
}: {
    data: FeeData[];
    month: number;
    year: number;
}) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = data.filter(row =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search by Name or ITS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 bg-white/50 border-gold/20 focus-visible:ring-gold"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Member</th>
                            <th className="px-6 py-3">Contribution</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 text-right">Due / Paid</th>
                            <th className="px-6 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredData.map((row) => (
                            <tr key={row.userId} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div>{row.name}</div>
                                    <div className="text-xs text-gray-500 font-mono">{row.username}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    <div className="font-medium">
                                        ₹{row.record ? row.record.amount : row.configAmount}
                                    </div>
                                    {row.record && row.record.amount !== row.configAmount && (
                                        <span className="text-[10px] text-amber-600 bg-amber-50 px-1 rounded">
                                            (Override)
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {row.record ? (
                                        <StatusBadge status={row.record.status} />
                                    ) : (
                                        <Badge variant="outline" className="text-gray-400 border-gray-200">
                                            Not Generated
                                        </Badge>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {row.record ? (
                                        <div className="space-y-1">
                                            <div className="font-medium">₹{row.record.amount}</div>
                                            {row.record.paidAmount > 0 && (
                                                <div className="text-xs text-green-600">
                                                    Paid: ₹{row.record.paidAmount}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <EditFeeDrawer
                                        userId={row.userId}
                                        userName={row.name}
                                        month={month}
                                        year={year}
                                        initialConfigAmount={row.configAmount}
                                        initialRecord={row.record}
                                    >
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-gold/10 hover:text-gold-dark">
                                            <Edit2 className="h-4 w-4" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                    </EditFeeDrawer>
                                </td>
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    {searchTerm ? "No members match your search." : "No members found."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "PAID":
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</Badge>;
        case "PARTIAL":
            return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Clock className="w-3 h-3 mr-1" /> Partial</Badge>;
        default:
            return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Pending</Badge>;
    }
}

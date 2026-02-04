"use client";

import { OrnateCard } from "@/components/ui/premium-components";
import { format } from "date-fns";
import { ArrowUpRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Transaction {
    id: string;
    amount: number;
    mode: string;
    reference: string | null;
    note: string | null;
    date: Date;
    user: {
        name: string | null;
        username: string;
    };
    allocations: {
        feeRecord?: {
            month: number;
            year: number;
        } | null;
        eventContribution?: {
            title: string;
        } | null;
    }[];
}

export function TransactionsTab({ transactions }: { transactions: Transaction[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTransactions = transactions.filter(tx =>
        tx.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.user.name && tx.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.reference && tx.reference.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search by User or Ref..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 bg-white/50 border-gold/20 focus-visible:ring-gold"
                />
            </div>

            <OrnateCard className="p-0 overflow-hidden border border-gold/20 shadow-2xl bg-white/90 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Member</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Mode</th>
                                <th className="px-6 py-3">Allocation</th>
                                <th className="px-6 py-3">Ref/Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                        {format(new Date(tx.date), "dd MMM yyyy")}
                                        <div className="text-xs opacity-70">{format(new Date(tx.date), "hh:mm a")}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{tx.user.name || tx.user.username}</div>
                                        <div className="text-xs text-gray-500 font-mono">{tx.user.username}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-green-700">
                                        ₹{tx.amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            {tx.mode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                        {tx.allocations.length > 0 ? (
                                            <div className="space-y-1">
                                                {tx.allocations.map((a, i) => (
                                                    <div key={i}>
                                                        {a.feeRecord ? (
                                                            <span>Contribution: {new Date(a.feeRecord.year, a.feeRecord.month).toLocaleString('default', { month: 'short' })} '{a.feeRecord.year.toString().slice(2)}</span>
                                                        ) : a.eventContribution ? (
                                                            <span>Event: {a.eventContribution.title}</span>
                                                        ) : (
                                                            <span>Unallocated</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Unallocated</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                                        {tx.reference && <div>Ref: {tx.reference}</div>}
                                        {tx.note && <div>Note: {tx.note}</div>}
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </OrnateCard>
        </div>
    );
}

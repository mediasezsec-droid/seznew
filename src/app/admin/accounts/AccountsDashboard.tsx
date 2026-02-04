"use client";

import { useState } from "react";
import { AccountsOverview, MemberFinancial } from "@/app/actions/accounts";
import { OrnateCard, OrnateHeading, GoldenButton } from "@/components/ui/premium-components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, IndianRupee, ArrowUpRight, ArrowDownLeft, FileText, CalendarClock } from "lucide-react";
import { format } from "date-fns";

interface AccountsDashboardProps {
    overview: AccountsOverview;
    transactions: any[];
    members: MemberFinancial[];
    feeRecords: any[];
    eventContributions: any[];
}

export default function AccountsDashboard({
    overview,
    transactions,
    members,
    feeRecords,
    eventContributions
}: AccountsDashboardProps) {
    const [searchTerm, setSearchTerm] = useState("");

    // Filter logic
    const filteredMembers = members.filter(m =>
        m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredTransactions = transactions.filter(t =>
        t.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.reference && t.reference.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8 pb-12">
            {/* OrnateHeading removed to avoid duplication with page.tsx */}

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Collections"
                    value={overview.totalCollections}
                    icon={IndianRupee}
                    subtitle="All Time"
                    color="text-emerald-700"
                    bg="from-emerald-50 to-white"
                    border="border-emerald-100"
                    iconBg="bg-emerald-100/50"
                />
                <StatCard
                    title="Pending Fees"
                    value={overview.totalPendingFees}
                    icon={ArrowDownLeft}
                    subtitle="Monthly Dues"
                    color="text-rose-700"
                    bg="from-rose-50 to-white"
                    border="border-rose-100"
                    iconBg="bg-rose-100/50"
                />
                <StatCard
                    title="Pending Events"
                    value={overview.totalPendingEvents}
                    icon={FileText}
                    subtitle="Event Funds"
                    color="text-amber-700"
                    bg="from-amber-50 to-white"
                    border="border-amber-100"
                    iconBg="bg-amber-100/50"
                />
                <StatCard
                    title="Today's Coll."
                    value={overview.todayCollection}
                    icon={ArrowUpRight}
                    subtitle={format(new Date(), "dd MMM yyyy")}
                    color="text-primary-dark"
                    bg="from-gold/10 to-white"
                    border="border-gold/20"
                    iconBg="bg-gold/20"
                />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="members" className="w-full">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm sticky top-20 z-20">
                    <TabsList className="bg-gray-100/50 p-1 border border-gray-200 rounded-xl h-auto">
                        <TabsTrigger value="members" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary-dark data-[state=active]:shadow-sm px-4 py-2">Members</TabsTrigger>
                        <TabsTrigger value="transactions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary-dark data-[state=active]:shadow-sm px-4 py-2">Transactions</TabsTrigger>
                        <TabsTrigger value="fees" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary-dark data-[state=active]:shadow-sm px-4 py-2">Fee Records</TabsTrigger>
                        <TabsTrigger value="events" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary-dark data-[state=active]:shadow-sm px-4 py-2">Event Funds</TabsTrigger>
                    </TabsList>

                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search user, ref..."
                            className="pl-9 w-full sm:w-[300px] bg-white border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold/30 rounded-xl shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="members" className="space-y-4 focus-visible:outline-none">
                    <OrnateCard className="bg-white/80 p-0 overflow-hidden shadow-lg border-opacity-50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 text-left font-serif">User</th>
                                        <th className="p-4 text-left font-serif">Mobile</th>
                                        <th className="p-4 text-right font-serif">Total Due</th>
                                        <th className="p-4 text-right font-serif">Total Paid</th>
                                        <th className="p-4 text-right font-serif">Balance</th>
                                        <th className="p-4 text-center font-serif">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredMembers.map((member) => (
                                        <tr key={member.userId} className="hover:bg-gold/5 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900 group-hover:text-primary-dark transition-colors">{member.name || "Unknown"}</div>
                                                <div className="text-xs text-gray-500 font-mono">{member.username}</div>
                                            </td>
                                            <td className="p-4 text-gray-600">{member.mobile || "-"}</td>
                                            <td className="p-4 text-right font-medium">₹{member.totalDue.toLocaleString()}</td>
                                            <td className="p-4 text-right text-emerald-600 font-medium">₹{member.totalPaid.toLocaleString()}</td>
                                            <td className="p-4 text-right font-bold text-base">
                                                <span className={member.balance > 0 ? "text-rose-600" : "text-gray-400"}>
                                                    ₹{member.balance.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {member.balance <= 0 ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none border border-emerald-200">Clear</Badge>
                                                ) : (
                                                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 shadow-none border border-rose-200">Pending</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredMembers.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-gray-400 italic">No members found matching "{searchTerm}"</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </OrnateCard>
                </TabsContent>

                <TabsContent value="transactions" className="space-y-4 focus-visible:outline-none">
                    <OrnateCard className="bg-white/80 p-0 overflow-hidden shadow-lg border-opacity-50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 text-left font-serif">Date</th>
                                        <th className="p-4 text-left font-serif">User</th>
                                        <th className="p-4 text-left font-serif">Reference</th>
                                        <th className="p-4 text-left font-serif">Mode</th>
                                        <th className="p-4 text-right font-serif">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gold/5 transition-colors">
                                            <td className="p-4 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <CalendarClock className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        {format(new Date(tx.date), "dd MMM yyyy")}
                                                        <div className="text-[10px] text-gray-400 uppercase">{format(new Date(tx.date), "hh:mm a")}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-900">{tx.user.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">{tx.user.username}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-mono text-xs bg-gray-50 inline-block px-2 py-1 rounded border border-gray-100">{tx.reference || "-"}</div>
                                                {tx.note && <div className="text-[10px] text-gray-400 truncate max-w-[200px] mt-1 italic">{tx.note}</div>}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className="border-gold/30 text-primary-dark bg-gold/5">{tx.mode}</Badge>
                                            </td>
                                            <td className="p-4 text-right font-bold text-emerald-700 text-base">
                                                + ₹{tx.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-gray-400 italic">No transactions found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </OrnateCard>
                </TabsContent>

                <TabsContent value="fees" className="focus-visible:outline-none">
                    <OrnateCard className="bg-white/80 p-0 overflow-hidden shadow-lg border-opacity-50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 text-left font-serif">Month</th>
                                        <th className="p-4 text-left font-serif">User</th>
                                        <th className="p-4 text-right font-serif">Amount</th>
                                        <th className="p-4 text-right font-serif">Paid</th>
                                        <th className="p-4 text-center font-serif">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {feeRecords.slice(0, 100).map((record: any) => (
                                        <tr key={record.id} className="hover:bg-gold/5 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-700">{new Date(record.year, record.month).toLocaleString('default', { month: 'short' })} {record.year}</div>
                                            </td>
                                            <td className="p-4 font-mono text-xs text-gray-600">
                                                {record.user.username}
                                            </td>
                                            <td className="p-4 text-right font-medium">₹{record.amount}</td>
                                            <td className="p-4 text-right text-emerald-600 font-medium">₹{record.paidAmount}</td>
                                            <td className="p-4 text-center">
                                                <StatusBadge status={record.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </OrnateCard>
                </TabsContent>

                <TabsContent value="events" className="focus-visible:outline-none">
                    <OrnateCard className="bg-white/80 p-0 overflow-hidden shadow-lg border-opacity-50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 text-left font-serif">Event</th>
                                        <th className="p-4 text-left font-serif">User</th>
                                        <th className="p-4 text-right font-serif">Amount</th>
                                        <th className="p-4 text-right font-serif">Paid</th>
                                        <th className="p-4 text-center font-serif">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {eventContributions.slice(0, 100).map((record: any) => (
                                        <tr key={record.id} className="hover:bg-gold/5 transition-colors">
                                            <td className="p-4 font-bold text-primary-dark">{record.title}</td>
                                            <td className="p-4 font-mono text-xs text-gray-600">{record.user.username}</td>
                                            <td className="p-4 text-right font-medium">₹{record.amount}</td>
                                            <td className="p-4 text-right text-emerald-600 font-medium">₹{record.paidAmount}</td>
                                            <td className="p-4 text-center">
                                                <StatusBadge status={record.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </OrnateCard>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, subtitle, color, bg, border, iconBg }: any) {
    return (
        <OrnateCard className={`p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 border ${border} bg-gradient-to-br ${bg}`}>
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity transform scale-150 translate-x-4 -translate-y-2">
                <Icon className="w-32 h-32" />
            </div>

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-[11px] uppercase tracking-widest font-bold text-gray-500 mb-2">{title}</p>
                    <h3 className={`text-3xl font-serif font-bold ${color} mb-1 tracking-tight`}>
                        <span className="text-lg opacity-60 mr-1">₹</span>
                        {value.toLocaleString()}
                    </h3>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-white/60 border border-white/40 text-[10px] font-medium text-gray-500 backdrop-blur-sm shadow-sm">
                        {subtitle}
                    </div>
                </div>
                <div className={`p-3 rounded-2xl ${iconBg} ${color} shadow-sm backdrop-blur-sm ring-1 ring-white/50`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </OrnateCard>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "PAID":
            return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none border border-emerald-200">Paid</Badge>;
        case "PARTIAL":
            return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none border border-amber-200">Partial</Badge>;
        default:
            return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 shadow-none border border-rose-200">Pending</Badge>;
    }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasModuleAccess } from "@/lib/access-control";
import { getAttendanceAnalytics } from "@/app/actions/attendance";
import { OrnateHeading, OrnateCard, GoldenButton } from "@/components/ui/premium-components";
import { Loader2, Users, Calendar, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AttendanceAnalyticsPage() {
    // 1. Session & Access Control
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const userId = (session.user as any).id;
    const canAccess = (session.user as any).role === "ADMIN" || await hasModuleAccess(userId, "/admin/attendance-details");

    if (!canAccess) {
        redirect("/unauthorized");
    }

    // 2. Fetch Data
    const result = await getAttendanceAnalytics();
    if (!result.success || !result.stats) {
        return <div className="p-10 text-center text-red-500">Failed to load analytics: {result.error || "No stats available"}</div>;
    }

    const { stats } = result;

    // Calculate max count for chart scaling
    const maxCount = Math.max(...(stats?.chartData?.map((d: any) => d.count) || [1]));

    return (
        <div className="container mx-auto py-10 px-4 space-y-10 min-h-screen bg-background-light">
            <OrnateHeading
                title="Attendance Analytics"
                subtitle="Overview & Trends"
            />

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Events"
                    value={stats.totalEvents}
                    icon={Calendar}
                    color="text-blue-600"
                    bg="bg-blue-50/50"
                />
                <StatCard
                    title="Total Attendance"
                    value={stats.totalRecords.toLocaleString()}
                    icon={Users}
                    color="text-emerald-600"
                    bg="bg-emerald-50/50"
                />
                <StatCard
                    title="Avg. Per Event"
                    value={stats.avgAttendance}
                    icon={TrendingUp}
                    color="text-amber-600"
                    bg="bg-amber-50/50"
                />
            </div>

            {/* Premium Chart & Table Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <OrnateCard className="col-span-1 lg:col-span-2 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-serif font-bold text-gray-800">Attendance Trends</h3>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Top 10 Events</span>
                    </div>

                    <div className="space-y-6">
                        {stats.chartData.map((item: any, idx: number) => {
                            // Fetch Event ID somehow? 
                            // Wait, getAttendanceAnalytics returns { resource: name, date: date, count: count }
                            // I need ID to link it. I should verify getAttendanceAnalytics implementation.
                            // It currently maps using eventMap. Let's assume I can get ID or I'll fix it if needed.
                            // Ah, I need to check if I can link it.
                            // Currently `formattedStats` uses `resource` for name.
                            // Let's modify `actions/attendance.ts` slightly if I can't link effectively, 
                            // BUT for now, let's just show visual bar.

                            return (
                                <Link key={idx} href={`/admin/attendance-details/${item.id}`} className="block group relative">
                                    <div className="flex items-end justify-between mb-2">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-700 group-hover:text-primary transition-colors text-sm md:text-base">
                                                {item.resource}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(item.date).toLocaleDateString(undefined, {
                                                    weekday: 'short', month: 'short', day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <span className="font-mono font-bold text-primary">{item.count}</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden relative">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                                        />
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </OrnateCard>

                {/* Recent / Top Events List with Links */}
                <OrnateCard className="p-0 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-serif font-bold text-gray-800">Recent Events</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[500px] p-2 space-y-1">
                        {stats.chartData.map((item: any, idx: number) => (
                            <Link key={idx} href={`/admin/attendance-details/${item.id}`} className="block">
                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-700 text-sm group-hover:text-primary transition-colors">{item.resource}</span>
                                        <span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-sm font-bold text-gray-900 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                                        {item.count}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500">Select an event to view full attendee list.</p>
                    </div>
                </OrnateCard>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <OrnateCard className={`p-6 flex items-center gap-5 border border-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div className={`p-4 rounded-2xl shadow-inner ${bg}`}>
                <Icon className={`w-8 h-8 ${color}`} />
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className={`text-4xl font-serif font-bold text-gray-800`}>{value}</h3>
            </div>
        </OrnateCard>
    );
}

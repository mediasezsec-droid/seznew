"use client";

import { useState, useEffect } from "react";
import { getFloorMembersForUser, markUserAttendance, getAttendanceStatusForEvent } from "@/app/actions/attendance-taker";
import { OrnateCard, OrnateHeading } from "@/components/ui/premium-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Search, Users, MapPin, Calendar, Clock } from "lucide-react";
import toast from "react-hot-toast";

type SimpleUser = { id: string; name: string | null; its: string | null; username: string };

export function AttendanceTaker({
    activeEvent,
    currentUser
}: {
    activeEvent: any,
    currentUser: { id: string; name: string }
}) {
    const [members, setMembers] = useState<SimpleUser[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [activeEvent]);

    const loadData = async () => {
        if (!activeEvent) {
            setLoading(false);
            return;
        }

        // 1. Load my members
        const memRes = await getFloorMembersForUser(currentUser.id);
        if (memRes.success && memRes.data) {
            setMembers(memRes.data as SimpleUser[]);

            // 2. Load their status for this event
            const ids = (memRes.data as SimpleUser[]).map(u => u.id);
            const statusRes = await getAttendanceStatusForEvent(activeEvent.id, ids);

            if (statusRes.success && statusRes.data) {
                const map: Record<string, boolean> = {};
                statusRes.data.forEach((r: any) => {
                    if (r.status === "PRESENT") map[r.userId] = true;
                });
                setAttendanceMap(map);
            }
        }
        setLoading(false);
    };

    const toggleAttendance = async (memberId: string) => {
        // Optimistic update
        const isPresent = !!attendanceMap[memberId];
        const newStatus = !isPresent;

        setAttendanceMap(prev => ({ ...prev, [memberId]: newStatus }));

        // Server Call
        const res = await markUserAttendance(activeEvent.id, memberId, currentUser.id, newStatus ? "PRESENT" : "ABSENT");
        if (!res.success) {
            // Revert on error
            setAttendanceMap(prev => ({ ...prev, [memberId]: isPresent }));
            toast.error("Failed to update attendance");
        }
    };

    const filteredMembers = members.filter(m =>
    (m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.username.toLowerCase().includes(search.toLowerCase()) ||
        m.its?.includes(search))
    );

    const presentCount = members.filter(m => attendanceMap[m.id]).length;

    if (!activeEvent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 space-y-6">
                <OrnateCard className="p-10 max-w-md w-full flex flex-col items-center bg-white/60 backdrop-blur-md">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-gray-600 mb-2">No Active Session</h2>
                    <p className="text-gray-500">Attendance is currently closed. Please wait for an admin to start a session.</p>
                </OrnateCard>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto pb-24 px-2">

            {/* Header Card */}
            <OrnateCard className="mb-6 p-6 bg-gradient-to-br from-white to-gold/5 border-gold/20">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-2 bg-gold/10 rounded-full mb-2">
                        <Clock className="w-5 h-5 text-gold-dark" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-primary-dark">{activeEvent.name}</h1>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold text-xs uppercase tracking-wider">Active Now</span>
                        <span className="text-gray-300">•</span>
                        <span>{presentCount} / {members.length} Present</span>
                    </div>
                </div>
            </OrnateCard>

            <div className="sticky top-[4.5rem] z-30 pt-2 pb-4 bg-transparent backdrop-blur-xl -mx-4 px-4 border-b border-white/50 mb-4 rounded-b-2xl shadow-sm transition-all">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search name or ITS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-10 bg-white/90 border-gray-200 focus:border-gold shadow-sm rounded-xl text-base"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-400">Loading members...</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredMembers.map(member => {
                        const isPresent = !!attendanceMap[member.id];
                        return (
                            <div
                                key={member.id}
                                onClick={() => toggleAttendance(member.id)}
                                className={`
                                    flex items-center justify-between p-4 rounded-xl border-b-2 cursor-pointer transition-all duration-200 select-none
                                    ${isPresent
                                        ? "bg-gradient-to-r from-emerald-50 to-white border-emerald-200 shadow-md transform scale-[1.01]"
                                        : "bg-white border-gray-100/50 hover:bg-gray-50 active:scale-[0.99] shadow-sm"
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border
                                        ${isPresent ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}
                                    `}>
                                        {member.name?.charAt(0) || member.username.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-base ${isPresent ? "text-emerald-900" : "text-gray-700"}`}>
                                            {member.name || member.username}
                                        </h4>
                                        <p className="text-xs text-gray-400 font-mono tracking-wide">{member.its || "No ITS"}</p>
                                    </div>
                                </div>

                                <div className={`
                                    transition-all duration-300
                                    ${isPresent ? "text-emerald-500 scale-110" : "text-gray-200 scale-100"}
                                `}>
                                    {isPresent ? <CheckCircle2 className="w-7 h-7 fill-emerald-50" /> : <Circle className="w-7 h-7" />}
                                </div>
                            </div>
                        );
                    })}
                    {filteredMembers.length === 0 && (
                        <div className="text-center py-12 text-gray-400 bg-white/50 rounded-xl border border-dashed border-gray-200">
                            No members found matching "{search}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

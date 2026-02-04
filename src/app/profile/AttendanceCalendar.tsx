"use client";

import { Calendar } from "@/components/ui/calendar";
import { OrnateCard } from "@/components/ui/premium-components";
import { cn } from "@/lib/utils";

interface AttendanceEvent {
    eventId: string;
    eventName: string;
    date: Date;
    status: "PRESENT" | "ABSENT";
}

interface AttendanceCalendarProps {
    history: AttendanceEvent[];
}

export function AttendanceCalendar({ history }: AttendanceCalendarProps) {
    // Convert history to modifiers
    const presentDates = history
        .filter((h) => h.status === "PRESENT")
        .map((h) => new Date(h.date));

    const absentDates = history
        .filter((h) => h.status === "ABSENT")
        .map((h) => new Date(h.date));

    return (
        <OrnateCard className="p-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Calendar Section */}
                <div className="flex-1 w-full flex justify-center">
                    <Calendar
                        mode="multiple"
                        selected={presentDates} // Highlight present days
                        className="rounded-md border shadow p-4 bg-white"
                        modifiers={{
                            present: presentDates,
                            absent: absentDates,
                        }}
                        modifiersClassNames={{
                            present: "bg-emerald-100 text-emerald-900 font-bold hover:bg-emerald-200",
                            absent: "bg-red-50 text-red-900 font-medium hover:bg-red-100 decoration-red-500",
                        }}
                    />
                </div>

                {/* Legend & Summary */}
                <div className="md:w-64 space-y-6 w-full">
                    <div>
                        <h3 className="font-serif font-bold text-lg mb-4 text-primary-dark">Attendance Key</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200" />
                                <span className="text-sm font-medium">Present</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-red-50 border border-red-100" />
                                <span className="text-sm font-medium">Absent</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-dashed border-gray-200">
                        <h3 className="font-serif font-bold text-lg mb-2 text-primary-dark">Recent History</h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {history.length === 0 && <p className="text-sm text-gray-400 italic">No attendance records found.</p>}
                            {history.slice(0, 10).map((record) => (
                                <div key={record.eventId} className="flex justify-between items-center text-sm p-2 rounded bg-gray-50/50">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-700">{record.eventName}</span>
                                        <span className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</span>
                                    </div>
                                    <span
                                        className={cn(
                                            "text-xs font-bold px-2 py-1 rounded-full",
                                            record.status === "PRESENT" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                        )}>
                                        {record.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </OrnateCard>
    );
}

"use client";

import { useState, useEffect } from "react";
import { getMisriDate, MisriDate } from "@/lib/misri-calendar";
import { cn } from "@/lib/utils";
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Event {
    id: string;
    name: string;
    occasionDay: string | null;
    description: string | null;
    occasionDate: Date; // Serialized as string from server usually, but we'll assume Date object passed or handled
    eventType: string;
}

export function HijriCalendar({ events }: { events: Event[] }) {
    const [viewDate, setViewDate] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState<{ date: Date; hijri: MisriDate }[]>([]);

    useEffect(() => {
        const start = startOfMonth(viewDate);
        const end = endOfMonth(viewDate);
        const days = eachDayOfInterval({ start, end });

        const daysWithHijri = days.map(day => ({
            date: day,
            hijri: getMisriDate(day)
        }));
        setCalendarDays(daysWithHijri);
    }, [viewDate]);

    const handlePrevMonth = () => setViewDate(prev => addDays(startOfMonth(prev), -1));
    const handleNextMonth = () => setViewDate(prev => addDays(endOfMonth(prev), 1));

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-neutral-mid/20 overflow-hidden">
            <div className="p-4 flex items-center justify-between bg-background-light border-b border-neutral-mid/10">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-neutral-mid/10 rounded-full">
                    <ChevronLeft className="w-5 h-5 text-neutral-dark" />
                </button>
                <h2 className="text-lg font-bold font-serif text-neutral-dark">
                    {format(viewDate, "MMMM yyyy")}
                </h2>
                <button onClick={handleNextMonth} className="p-2 hover:bg-neutral-mid/10 rounded-full">
                    <ChevronRight className="w-5 h-5 text-neutral-dark" />
                </button>
            </div>

            <div className="grid grid-cols-7 border-b border-neutral-mid/10 bg-neutral-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-neutral-mid uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-neutral-mid/10">
                {/* Filler for start of month alignment - simplified here, assumed aligned or add logic */}
                {Array.from({ length: startOfMonth(viewDate).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-32 bg-neutral-50/50" />
                ))}

                {calendarDays.map(({ date, hijri }) => {
                    const dayEvents = events.filter(e => isSameDay(new Date(e.occasionDate), date));
                    const isToday = isSameDay(date, new Date());

                    return (
                        <div key={date.toISOString()} className={cn("h-32 p-2 flex flex-col relative group hover:bg-background-light/30 transition-colors", isToday && "bg-primary/5")}>
                            <div className="flex justify-between items-start">
                                <span className={cn("text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full", isToday ? "bg-primary text-white" : "text-neutral-dark")}>
                                    {date.getDate()}
                                </span>
                                <div className="text-right">
                                    <span className="block text-xs font-arabic text-primary">{hijri.formattedAr.split(' ')[0]}</span>
                                    <span className="block text-[10px] text-neutral-mid">{hijri.monthName}</span>
                                </div>
                            </div>
                            <div className="mt-2 space-y-1 overflow-y-auto scrollbar-hide">
                                {dayEvents.map(event => (
                                    <div key={event.id} className="text-xs bg-primary/10 text-primary-dark px-1.5 py-0.5 rounded truncate" title={event.description || event.name}>
                                        {event.description || event.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

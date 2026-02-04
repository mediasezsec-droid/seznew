import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasModuleAccess } from "@/lib/access-control";
import { getEventAttendees } from "@/app/actions/attendance";
import { OrnateHeading, OrnateCard, GoldenButton } from "@/components/ui/premium-components";
import { ArrowLeft, User, MapPin, Shield } from "lucide-react";
import Link from "next/link";

export default async function EventAttendeesPage({ params }: { params: { eventId: string } }) {
    // 1. Session & Access Control
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const userId = (session.user as any).id;
    const canAccess = (session.user as any).role === "ADMIN" || await hasModuleAccess(userId, "/admin/attendance-details");

    if (!canAccess) {
        redirect("/unauthorized");
    }

    // Await params (Next.js 15+ requirement, good practice)
    const { eventId } = await params;

    // 2. Fetch Data
    const result = await getEventAttendees(eventId);

    if (!result.success || !result.event) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold">Event not found</h2>
            </div>
        );
    }

    const { event, attendees } = result;

    return (
        <div className="container mx-auto py-10 px-4 space-y-8 min-h-screen bg-background-light">
            {/* Header */}
            <div>
                <Link href="/admin/attendance-details" className="inline-flex items-center text-sm font-medium text-primary hover:underline mb-4">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Analytics
                </Link>
                <OrnateHeading
                    title={event.name}
                    subtitle={`${new Date(event.occasionDate).toDateString()} • ${attendees?.length || 0} Present`}
                />
            </div>

            {/* Attendees Table */}
            <OrnateCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-primary/5 text-primary-dark font-serif border-b border-primary/10">
                            <tr>
                                <th className="px-6 py-4 font-bold">Member</th>
                                <th className="px-6 py-4 font-bold">Floor</th>
                                <th className="px-6 py-4 font-bold">Head</th>
                                <th className="px-6 py-4 font-bold">Marked At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {attendees?.map((attendee) => (
                                <tr key={attendee.id} className="hover:bg-primary/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {attendee.name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 group-hover:text-primary transition-colors">{attendee.name}</p>
                                                <p className="text-xs text-gray-400">{attendee.its}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="w-3.5 h-3.5 opacity-50" />
                                            <span>{attendee.floor}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Shield className="w-3.5 h-3.5 opacity-50" />
                                            <span>{attendee.head}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                        {new Date(attendee.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            ))}
                            {attendees?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500 italic">
                                        No attendees recorded for this event.
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

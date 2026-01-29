import { prisma } from "@/lib/db";
import { HijriCalendar } from "@/components/Calendar";
import { OrnateHeading, OrnateCard } from "@/components/ui/premium-components";

// Public Calendar Page
export const dynamic = 'force-dynamic';

export default async function EventsPage() {
    const events = await prisma.event.findMany({
        where: {
            eventType: 'PUBLIC',
            status: {
                not: 'CANCELLED'
            }
        },
        select: {
            id: true,
            name: true,
            occasionDay: true,
            occasionDate: true,
            description: true,
            eventType: true,
        }
    });

    return (
        <div className="min-h-screen py-12 px-4 md:px-8 mt-12">
            <div className="max-w-7xl mx-auto space-y-8">
                <OrnateHeading
                    title="Community Calendar"
                    subtitle="Upcoming public events and Hijri dates"
                    arabic="التقويم الهجري"
                />

                <OrnateCard className="p-4 md:p-8 bg-white/80">
                    <HijriCalendar events={events} />
                </OrnateCard>
            </div>
        </div>
    );
}

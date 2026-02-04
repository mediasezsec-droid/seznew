import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { OrnateHeading, OrnateCard } from "@/components/ui/premium-components";
import { ProfileForm } from "./ProfileForm";
import { getUserFees, getUserTransactions, getUserEventContributions } from "@/app/actions/fees";
import { FeeList } from "@/app/fees/FeeList";
import { TransactionHistory } from "@/app/fees/TransactionHistory";
import { UnifiedPaymentDrawer } from "@/app/fees/UnifiedPaymentDrawer";
import { EventContributionList } from "@/app/fees/EventContributionList";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: {
            id: true,
            username: true,
            name: true,
            email: true,
            mobile: true,
            role: true,
            createdAt: true,
        },
    });

    if (!user) {
        redirect("/login");
    }

    const userModules = await prisma.userModuleAccess.findMany({
        where: { userId: (session.user as any).id },
        include: { module: true }
    });

    // Fetch Fee Data
    const [feesResult, transactionsResult, eventsResult] = await Promise.all([
        getUserFees((session.user as any).id),
        getUserTransactions((session.user as any).id),
        getUserEventContributions((session.user as any).id)
    ]);

    // Ensure we handle undefined data gracefully
    const fees = (feesResult.success && feesResult.data) ? feesResult.data : [];
    // @ts-ignore - Transaction type complexity
    const transactions = (transactionsResult.success && transactionsResult.data) ? transactionsResult.data : [];
    const events = (eventsResult.success && eventsResult.data) ? eventsResult.data : [];

    // Filter pending/partial items
    const pendingFees = fees.filter(f => f.status !== "PAID");
    const pendingEvents = events.filter(e => e.status !== "PAID");

    return (
        <div className="min-h-screen py-20 px-4 bg-background-light">
            <div className="max-w-2xl mx-auto space-y-8">
                <OrnateHeading
                    title="My Profile"
                    arabic="الملف الشخصي"
                />

                <OrnateCard className="p-8 border border-gold/20 shadow-2xl bg-white/90">
                    <ProfileForm user={user} assignedModules={userModules.map(m => m.module)} />
                </OrnateCard>

                {/* Divider */}
                <div className="flex items-center gap-4 py-4">
                    <div className="h-px bg-gold/20 flex-1" />
                    <span className="font-serif text-xl text-primary-dark font-bold">Contributions</span>
                    <div className="h-px bg-gold/20 flex-1" />
                </div>

                {/* Fee Section */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <UnifiedPaymentDrawer
                            pendingFees={pendingFees}
                            pendingEvents={pendingEvents}
                            username={user.username}
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-serif font-bold text-primary-dark border-b border-gold/20 pb-2">Monthly Contributions</h3>
                        <FeeList fees={fees} username={user.username} />
                    </div>

                    <EventContributionList events={events} username={user.username} />

                    {transactions && transactions.length > 0 && (
                        <TransactionHistory transactions={transactions} />
                    )}
                </div>
            </div>
        </div>
    );
}

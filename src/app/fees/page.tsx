import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserFees, getUserTransactions } from "@/app/actions/fees";
import { FeeList } from "./FeeList";
import { TransactionHistory } from "./TransactionHistory";
import { CustomPaymentButton } from "./CustomPaymentButton";
import { OrnateHeading } from "@/components/ui/premium-components";

export default async function UserFeesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const username = (session.user as any).username;
    const userId = (session.user as any).id;
    const [feesResult, transactionsResult] = await Promise.all([
        getUserFees(userId),
        getUserTransactions(userId)
    ]);

    if (!feesResult.success || !feesResult.data) {
        return (
            <div className="min-h-screen pt-24 px-4 text-center">
                <OrnateHeading title="Voluntary Contributions" />
                <p className="mt-8 text-red-500">Failed to load information.</p>
            </div>
        );
    }

    const fees = feesResult.data;
    const transactions = transactionsResult.success ? transactionsResult.data : [];

    return (
        <div className="min-h-screen py-10 px-4 md:px-8 bg-neutral-50/50">
            <div className="max-w-2xl mx-auto space-y-8">
                <OrnateHeading
                    title="Voluntary Contributions"
                    subtitle="View your monthly contributions and history"
                    arabic="المساهمات الطوعية"
                />

                <CustomPaymentButton username={username} />

                <div className="space-y-4">
                    <h3 className="text-xl font-serif font-bold text-primary-dark border-b border-gold/20 pb-2">Monthly Contributions</h3>
                    <FeeList fees={fees} username={username} />
                </div>

                {transactions && transactions.length > 0 && (
                    <TransactionHistory transactions={transactions} />
                )}
            </div>
        </div>
    );
}

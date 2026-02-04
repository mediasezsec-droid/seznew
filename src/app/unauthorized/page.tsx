import { OrnateCard, GoldenButton } from "@/components/ui/premium-components";
import { ShieldX } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";

export default async function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
            <OrnateCard className="max-w-md w-full p-8 text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                        <ShieldX className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Access Restricted</h1>
                    <p className="text-gray-500">
                        You do not have the required permissions to access this page.
                    </p>
                </div>

                <div className="pt-2">
                    <Link href="/dashboard" className="w-full">
                        <GoldenButton className="w-full justify-center">
                            Return to Dashboard
                        </GoldenButton>
                    </Link>
                </div>
            </OrnateCard>
        </div>
    );
}

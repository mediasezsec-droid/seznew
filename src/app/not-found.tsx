import Link from "next/link";
import { OrnateCard, GoldenButton } from "@/components/ui/premium-components";
import { ArrowLeft, Home, SearchX } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light p-4">
            <div className="max-w-xl w-full">
                <OrnateCard className="text-center p-12 space-y-8 relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary-dark" />

                    <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center animate-pulse">
                            <SearchX className="w-12 h-12 text-red-500" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-6xl font-serif font-bold text-gray-900">404</h1>
                        <h2 className="text-2xl font-serif text-gray-700">Page Not Found</h2>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link href="/">
                            <GoldenButton className="w-full sm:w-auto flex items-center justify-center gap-2">
                                <Home className="w-4 h-4" />
                                Return Home
                            </GoldenButton>
                        </Link>
                    </div>

                    <div className="text-xs text-gray-300 pt-8 font-mono">
                        ERROR_CODE: PAGE_NOT_FOUND
                    </div>
                </OrnateCard>
            </div>
        </div>
    );
}

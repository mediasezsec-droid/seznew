"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GoldenButton, OrnateCard, OrnateHeading } from "@/components/ui/premium-components";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import Link from "next/link";
import { Toaster } from 'react-hot-toast';

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Invalid credentials");
            } else {
                toast.success("Logged in successfully");
                router.push("/admin/banners");
                router.refresh();
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-dark/95 relative px-4 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/bg.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>

            <Toaster />

            <div className="w-full max-w-md relative z-10">
                <OrnateCard className="bg-cream/95 backdrop-blur-xl border-gold/30">
                    <div className="text-center mb-8">
                        <OrnateHeading
                            title="Sign In"
                            subtitle="Admin Portal Access"
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-bold text-primary-dark uppercase tracking-wider block">Username</label>
                            <Input
                                type="text"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-white border-gold/30 focus-visible:ring-gold/50 h-12 text-base text-neutral-900"
                                required
                            />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-bold text-primary-dark uppercase tracking-wider block">Password</label>
                            <Input
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white border-gold/30 focus-visible:ring-gold/50 h-12 text-base text-neutral-900"
                                required
                            />
                        </div>

                        <div className="pt-4">
                            <GoldenButton className="w-full justify-center text-lg h-12" disabled={loading}>
                                {loading ? "Signing in..." : "Sign In"}
                            </GoldenButton>
                        </div>

                        <div className="text-center text-sm text-neutral-600 mt-6 font-medium">
                            <Link href="/" className="hover:text-gold transition-colors flex items-center justify-center gap-2">
                                ← Back to Home
                            </Link>
                        </div>
                    </form>
                </OrnateCard>
            </div>
        </div>
    );
}

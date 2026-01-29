"use client";

import { submitKhidmatRequest } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { GoldenButton } from "../ui/premium-components";

export function KhidmatForm() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        const result = await submitKhidmatRequest(formData);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Thank you for your invitation. We will get in touch shortly.");
            (document.getElementById("khidmatForm") as HTMLFormElement)?.reset();
        }
    };

    // Premium Input Styles
    const inputClasses = "bg-white/60 border-gold/30 focus:border-gold focus:ring-gold/30 h-12 text-md placeholder:text-neutral-500 rounded-lg shadow-sm";
    const labelClasses = "block text-sm font-bold text-primary-dark mb-1.5 ml-1 uppercase tracking-wide";

    return (
        <>
            <Toaster />
            <form id="khidmatForm" action={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                    <div className="group">
                        <label className={labelClasses}>Miqat</label>
                        <Input
                            name="miqat"
                            required
                            placeholder="E.g., Urs Mubarak"
                            className={inputClasses}
                        />
                    </div>

                    <div className="group">
                        <label className={labelClasses}>Name</label>
                        <Input
                            name="name"
                            required
                            placeholder="Your Name"
                            className={inputClasses}
                        />
                    </div>

                    <div className="group">
                        <label className={labelClasses}>Phone Number</label>
                        <Input
                            name="phone"
                            required
                            type="tel"
                            maxLength={10}
                            placeholder="10-digit Mobile Number"
                            className={inputClasses}
                        />
                    </div>

                    <div className="group">
                        <label className={labelClasses}>Date</label>
                        <Input
                            name="dateOn"
                            type="date"
                            required
                            className={inputClasses}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <GoldenButton
                        type="submit"
                        disabled={loading}
                        className="w-full text-lg shadow-xl"
                    >
                        {loading ? "Sending..." : "Send Invitation"}
                    </GoldenButton>
                </div>
            </form>
        </>
    );
}

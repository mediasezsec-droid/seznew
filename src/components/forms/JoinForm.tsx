"use client";

import { submitMemberRegistration } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { GoldenButton } from "../ui/premium-components";

export function JoinForm() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        const result = await submitMemberRegistration(formData);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Registration successful! We will contact you soon.");
            (document.getElementById("joinForm") as HTMLFormElement)?.reset();
        }
    };

    const inputClasses = "bg-white/60 border-gold/30 focus:border-gold focus:ring-gold/30 h-12 text-md placeholder:text-neutral-500 rounded-lg shadow-sm";
    const labelClasses = "block text-xs font-bold text-primary-dark uppercase tracking-wider ml-1 mb-1";
    const selectClasses = "w-full h-12 px-3 rounded-lg bg-white/60 border border-gold/30 focus:border-gold focus:ring-1 focus:ring-gold/30 outline-none transition-all text-neutral-800 shadow-sm";

    return (
        <>
            <Toaster />
            <form id="joinForm" action={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-1">
                        <label className={labelClasses}>Title</label>
                        <select name="title" required className={selectClasses}>
                            <option value="Bhai">Bhai</option>
                            <option value="Shaikh">Shaikh</option>
                            <option value="Mulla">Mulla</option>
                            <option value="NKD">NKD</option>
                            <option value="MKD">MKD</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className={labelClasses}>Full Name (ITS)</label>
                        <Input name="name" required placeholder="Full Name" className={inputClasses} />
                    </div>

                    <div className="space-y-1">
                        <label className={labelClasses}>ITS Number</label>
                        <Input name="ITS" required maxLength={8} placeholder="8-Digit ITS" className={inputClasses} />
                    </div>

                    <div className="space-y-1">
                        <label className={labelClasses}>Email</label>
                        <Input name="email" type="email" required placeholder="email@example.com" className={inputClasses} />
                    </div>

                    <div className="space-y-1">
                        <label className={labelClasses}>Date of Birth</label>
                        <Input name="dob" type="date" required className={inputClasses} />
                    </div>

                    <div className="space-y-1">
                        <label className={labelClasses}>WhatsApp Number</label>
                        <Input name="phone" required maxLength={10} placeholder="10-digit number" className={inputClasses} />
                    </div>

                    <div className="space-y-1">
                        <label className={labelClasses}>Quran Hifz</label>
                        <select name="quranHifz" required className={selectClasses}>
                            <option value="Juz-Amma">Juz Amma</option>
                            <option value="Surat-Balad">Surat Ul Balad</option>
                            <option value="Surat-asr">Surat Ul Asr</option>
                            <option value="Sana-Ula">Sana Ula</option>
                            <option value="Sana-Saniya">Sana Saniya</option>
                            <option value="Sana-Salesa">Sana Salesa</option>
                            <option value="Mukammal-Quran">Mukammal Quran</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className={labelClasses}>Valid Passport?</label>
                        <select name="passport" required className={selectClasses}>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="In-Process">In Process</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className={labelClasses}>Kun Safar?</label>
                        <select name="kunSafar" required className={selectClasses}>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <label className={labelClasses}>Occupation / Interests</label>
                        <Input name="occupation/interests" required placeholder="E.g., Engineering, Design, Khidmat..." className={inputClasses} />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <label className={labelClasses}>Sports</label>
                        <Input name="sports" required placeholder="Cricket, Football, etc." className={inputClasses} />
                    </div>
                </div>

                <div className="pt-6">
                    <GoldenButton
                        type="submit"
                        disabled={loading}
                        className="w-full text-lg mt-4 shadow-xl"
                    >
                        {loading ? "Submitting..." : "Submit Application"}
                    </GoldenButton>
                </div>
            </form>
        </>
    );
}

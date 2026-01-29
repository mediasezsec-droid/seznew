"use client";

import { useState } from "react";
import { createBanner } from "@/app/actions/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { GoldenButton, OrnateCard } from "@/components/ui/premium-components";
import toast from "react-hot-toast";

export function BannerForm() {
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        if (!imageUrl) {
            toast.error("Please upload a banner image");
            return;
        }

        setLoading(true);
        // Append the uploaded image URL to the form data
        formData.append('imageUrl', imageUrl);

        try {
            await createBanner(formData);
            toast.success("Banner created successfully");
            setImageUrl(""); // Reset form
            // Optional: You might want to reset other fields or reload via router.refresh() 
            // but the server action usually handles revalidation.
        } catch (error) {
            toast.error("Failed to create banner");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <OrnateCard className="p-8 md:p-12">
            <div className="mb-10 text-center border-b border-gold/10 pb-6">
                <h2 className="text-3xl font-serif font-bold text-primary-dark">Add New Banner</h2>
                <p className="text-neutral-500 mt-2">Upload a high-quality banner for the homepage slider.</p>
            </div>

            <form action={handleSubmit} className="space-y-10">
                <div className="space-y-3">
                    <label className="text-base font-bold text-neutral-800 flex items-center gap-2">
                        Banner Image
                        <span className="text-xs font-normal text-gold bg-gold/5 px-2 py-0.5 rounded border border-gold/20">851 x 315</span>
                    </label>
                    <ImageUpload
                        value={imageUrl}
                        onChange={setImageUrl}
                        aspectRatio={851 / 315}
                        disabled={loading}
                    />
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-3">
                        <label className="text-base font-bold text-neutral-800">Redirect Link <span className="text-neutral-400 font-normal text-sm ml-1">(Optional)</span></label>
                        <Input
                            name="href"
                            placeholder="e.g., /events or https://external.com"
                            className="bg-white border-neutral-200 focus:border-gold focus:ring-4 focus:ring-gold/10 transition-all h-12 text-base shadow-sm"
                        />
                        <p className="text-xs text-neutral-500 ml-1">The user will be navigated here when clicking the banner.</p>
                    </div>

                    <div className="bg-gold/5 border border-gold/10 rounded-xl p-6 flex items-start gap-4">
                        <div className="relative flex items-center mt-1">
                            <input
                                type="checkbox"
                                name="isActive"
                                id="isActive"
                                className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-neutral-300 shadow-sm checked:bg-gold checked:border-gold transition-all"
                            />
                            <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="isActive" className="text-base font-bold text-neutral-800 cursor-pointer select-none">Set Active Immediately</label>
                            <p className="text-sm text-neutral-500">If checked, this banner will be visible on the homepage immediately after upload.</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-neutral-100">
                    <GoldenButton disabled={loading} className="w-full text-lg py-4 shadow-xl shadow-gold/10">
                        {loading ? "Creating Banner..." : "Add Banner"}
                    </GoldenButton>
                </div>
            </form>
        </OrnateCard>
    );
}

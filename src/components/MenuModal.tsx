"use client"
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Utensils, X, ChefHat } from "lucide-react";
import { OrnateCard } from "./ui/premium-components";

interface MenuModalProps {
    title: string;
    menu: string;
    time: string;
    thaalCount: number;
    halls: string[];
    hallCounts: any;
}

export function MenuModal({ title, menu, time, thaalCount, halls, hallCounts }: MenuModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Parse hallCounts safely
    const hallData = hallCounts && typeof hallCounts === 'object' && !Array.isArray(hallCounts)
        ? Object.entries(hallCounts)
        : halls.map(h => [h, "-"]); // Fallback if no specific counts

    return (
        <>
            {/* Coupon Alert Bar */}
            <div
                onClick={() => setIsOpen(true)}
                className="w-full max-w-[851px] mx-auto px-4 sm:px-0 mb-6 animate-in slide-in-from-top-4 duration-700 cursor-pointer"
            >
                <div className="bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-cream p-4 rounded-xl shadow-lg border border-gold/30 flex items-center justify-between group hover:shadow-gold/20 transition-all transform hover:-translate-y-0.5">
                    <div className="flex items-center gap-4">
                        <div className="bg-gold/20 p-2 rounded-full ring-1 ring-gold/40 group-hover:bg-gold/30 transition-colors animate-pulse">
                            <Utensils className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-gold font-bold mb-0.5">Today's Menu • click to view</p>
                            <p className="font-serif font-bold text-lg leading-none group-hover:text-white transition-colors">
                                {title}
                            </p>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg border border-white/10">
                        <ChefHat className="w-4 h-4 text-gold/80" />
                        <span className="text-xs font-semibold tracking-wide">View Details</span>
                    </div>
                </div>
            </div>

            {/* Modal Overlay - Portaled */}
            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-sm animate-in fade-in duration-200">
                    {/* Backdrop click to close */}
                    <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

                    <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 duration-300">
                        <OrnateCard className="bg-white text-center p-0 overflow-hidden shadow-2xl border-gold/50 w-full max-h-[85dvh] flex flex-col">
                            {/* Header - Fixed at top */}
                            <div className="bg-primary-dark p-6 relative shrink-0">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-4 right-4 text-cream/50 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="space-y-4">
                                    <span className="inline-block px-3 py-1 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest border border-gold/20">
                                        Today's Feast
                                    </span>
                                    <h3 className="font-serif text-2xl font-bold text-cream leading-tight">
                                        {title}
                                    </h3>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto flex-1 min-h-0 overscroll-y-contain">
                                {/* Menu Content */}
                                <div className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="font-serif text-xl text-primary-dark font-bold">The Menu</h4>
                                        <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
                                    </div>

                                    <div className="prose prose-sm mx-auto text-neutral-600 font-medium leading-relaxed bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                                        <div className="whitespace-pre-wrap">
                                            {menu}
                                        </div>
                                    </div>
                                </div>

                                {/* Hall Allocation */}
                                <div className="bg-primary-dark/5 p-4 border-y border-gold/10">
                                    <h4 className="text-xs font-bold text-primary-dark uppercase tracking-widest mb-3">Hall Allocation</h4>
                                    <div className="bg-white rounded-lg border border-gold/20 overflow-hidden text-sm">
                                        <div className="grid grid-cols-2 bg-primary-dark text-cream text-xs font-bold uppercase py-2 px-4 text-left">
                                            <span>Hall Name</span>
                                            <span className="text-right">Thaals</span>
                                        </div>
                                        <div className="divide-y divide-neutral-100 max-h-48 overflow-y-auto overscroll-contain">
                                            {hallData.map(([name, count]: any, idx: number) => (
                                                <div key={idx} className="grid grid-cols-2 py-2 px-4 text-neutral-700 hover:bg-neutral-50 transition-colors">
                                                    <span className="font-medium text-left">{name}</span>
                                                    <span className="text-right font-bold text-primary">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </OrnateCard>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

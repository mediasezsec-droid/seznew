"use client";

import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid } from "lucide-react";
import { ModuleForm } from "./ModuleForm";

export function AddModuleDrawer() {
    const [open, setOpen] = useState(false);

    // We can pass a callback to close the drawer on success if ModuleForm supports it
    // For now assuming ModuleForm handles its own state or revalidation

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button className="bg-gold hover:bg-gold-dark text-black font-bold shadow-lg transition-all transform hover:scale-105">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Module
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[auto] max-h-[85vh] rounded-t-3xl">
                <div className="mx-auto w-full max-w-lg bg-white/60 backdrop-blur-md pb-8">
                    <DrawerHeader className="pb-6 pt-8 border-b border-gray-100 text-left px-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center text-primary-dark shadow-sm">
                                <LayoutGrid className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <DrawerTitle className="text-2xl font-serif font-bold text-primary-dark">Add New Module</DrawerTitle>
                                <DrawerDescription className="text-sm text-gray-500">
                                    Create a new access control module and define its links.
                                </DrawerDescription>
                            </div>
                        </div>
                    </DrawerHeader>

                    <div className="p-6">
                        <ModuleForm onSuccess={() => setOpen(false)} />
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

"use client";

import { useState } from "react";
import { createBlog } from "@/app/actions/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoldenButton, OrnateCard } from "@/components/ui/premium-components";
import { TiptapEditor } from "@/components/TiptapEditor";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function BlogForm() {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        if (!content || content === "<p></p>") {
            toast.error("Please add some content");
            return;
        }

        setLoading(true);
        // Append content manually since it's state-controlled
        formData.append('content', content);

        try {
            await createBlog(formData);
            toast.success("Blog post created successfully");
            router.push("/admin/blogs");
            router.refresh();
        } catch (error) {
            toast.error("Failed to create blog post");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <OrnateCard className="p-8 md:p-12">
            <div className="mb-10 text-center border-b border-gold/10 pb-6">
                <h2 className="text-3xl font-serif font-bold text-primary-dark">Create New Blog</h2>
                <p className="text-neutral-500 mt-2">Share updates and events with the community.</p>
            </div>

            <form action={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                    <label className="text-base font-bold text-neutral-800">Title</label>
                    <Input
                        name="title"
                        placeholder="Enter blog title..."
                        className="bg-white border-neutral-200 focus:border-gold focus:ring-4 focus:ring-gold/10 transition-all h-12 text-lg font-serif"
                        required
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-base font-bold text-neutral-800">Author</label>
                    <Input
                        name="author"
                        placeholder="e.g. Admin or Committee Name"
                        defaultValue="SEZ Committee"
                        className="bg-white border-neutral-200 focus:border-gold focus:ring-4 focus:ring-gold/10 transition-all h-12"
                        required
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-base font-bold text-neutral-800">Content</label>
                    <TiptapEditor
                        value={content}
                        onChange={setContent}
                        disabled={loading}
                    />
                </div>

                <div className="pt-4 border-t border-neutral-100">
                    <GoldenButton disabled={loading} className="w-full text-lg py-4 shadow-xl shadow-gold/10">
                        {loading ? "Publishing..." : "Publish Post"}
                    </GoldenButton>
                </div>
            </form>
        </OrnateCard>
    );
}

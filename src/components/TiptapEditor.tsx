"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Undo, Redo, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface TiptapEditorProps {
    value: string;
    onChange: (content: string) => void;
    disabled?: boolean;
}

export function TiptapEditor({ value, onChange, disabled }: TiptapEditorProps) {
    const [showImageModal, setShowImageModal] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState("");

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto shadow-md border border-neutral-200 my-4',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editable: !disabled,
        editorProps: {
            attributes: {
                class: 'prose prose-neutral max-w-none focus:outline-none min-h-[300px] px-4 py-3',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const handleImageInsert = (url: string) => {
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
            setShowImageModal(false);
            setTempImageUrl("");
        }
    };

    return (
        <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-gold/20 transition-shadow">
            {/* Toolbar */}
            <div className="bg-neutral-50 border-b border-neutral-200 p-2 flex flex-wrap gap-1">
                <Toggle
                    pressed={editor.isActive('bold')}
                    onPressedChange={() => editor.chain().focus().toggleBold().run()}
                    icon={<Bold className="w-4 h-4" />}
                    title="Bold"
                />
                <Toggle
                    pressed={editor.isActive('italic')}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                    icon={<Italic className="w-4 h-4" />}
                    title="Italic"
                />
                <div className="w-px h-6 bg-neutral-300 mx-1 self-center" />
                <Toggle
                    pressed={editor.isActive('bulletList')}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                    icon={<List className="w-4 h-4" />}
                    title="Bullet List"
                />
                <Toggle
                    pressed={editor.isActive('orderedList')}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                    icon={<ListOrdered className="w-4 h-4" />}
                    title="Ordered List"
                />
                <Toggle
                    pressed={editor.isActive('blockquote')}
                    onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                    icon={<Quote className="w-4 h-4" />}
                    title="Blockquote"
                />
                <div className="w-px h-6 bg-neutral-300 mx-1 self-center" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImageModal(true)}
                    className="h-8 w-8 p-0 hover:bg-neutral-200 text-neutral-700"
                    title="Insert Image"
                    disabled={disabled}
                >
                    <ImageIcon className="w-4 h-4" />
                </Button>
                <div className="flex-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo() || disabled}
                    className="h-8 w-8 p-0"
                >
                    <Undo className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo() || disabled}
                    className="h-8 w-8 p-0"
                >
                    <Redo className="w-4 h-4" />
                </Button>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />

            {/* Image Upload Modal */}
            <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Insert Image</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <ImageUpload
                            value={tempImageUrl}
                            onChange={(url) => {
                                setTempImageUrl(url);
                                handleImageInsert(url);
                            }}
                            disabled={disabled}
                        />
                        <p className="text-sm text-neutral-500 text-center">
                            Upload an image to insert it into the blog post.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Toggle({ pressed, onPressedChange, icon, title }: { pressed: boolean; onPressedChange: () => void; icon: React.ReactNode; title: string }) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onPressedChange}
            className={cn(
                "h-8 w-8 p-0 transition-colors",
                pressed ? "bg-gold/20 text-primary-dark" : "hover:bg-neutral-200 text-neutral-600"
            )}
            title={title}
        >
            {icon}
        </Button>
    );
}

"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/canvasUtils";
import { GoldenButton } from "./premium-components";
import { Upload, X, Check, Image as ImageIcon, ZoomIn, Loader2 } from "lucide-react";
import axios from "axios";

interface ImageUploadProps {
    value: string;
    onChange: (value: string) => void;
    aspectRatio?: number;
    disabled?: boolean;
}

export function ImageUpload({
    value,
    onChange,
    aspectRatio = 16 / 9,
    disabled
}: ImageUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showCropper, setShowCropper] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(selectedFile);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
        disabled: disabled || loading
    });

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleUpload = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        try {
            setLoading(true);
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);

            const { data: { signature, timestamp, folder } } = await axios.post("/api/cloudinary/sign");

            const formData = new FormData();
            formData.append("file", croppedImage);
            formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "679894143279575");
            formData.append("timestamp", timestamp);
            formData.append("signature", signature);
            if (folder) formData.append("folder", folder);

            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "drxudfb3o"}/image/upload`,
                formData
            );

            onChange(response.data.secure_url);
            setShowCropper(false);
            setImageSrc(null);
            setFile(null);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        onChange("");
    };

    return (
        <div className="space-y-4">
            {value ? (
                <div className="relative w-full aspect-[851/315] rounded-xl overflow-hidden border border-gold/40 shadow-lg group bg-neutral-100">
                    <img src={value} alt="Banner" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                            <button
                                onClick={handleRemove}
                                type="button"
                                disabled={disabled}
                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                title="Remove Image"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Check className="w-3 h-3" /> Uploaded
                    </div>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={`
            relative overflow-hidden
            border-2 border-dashed rounded-xl p-8 md:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300
            ${isDragActive ? "border-gold bg-gold/5 scale-[1.02]" : "border-neutral-300 hover:border-gold/60 hover:bg-neutral-50"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
                >
                    <input {...getInputProps()} />
                    <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300
                        ${isDragActive ? "bg-gold text-white rotate-12" : "bg-neutral-100 text-neutral-400 group-hover:text-gold"}
                    `}>
                        {loading ? <Loader2 className="w-8 h-8 animate-spin text-gold" /> : <ImageIcon className="w-8 h-8" />}
                    </div>

                    <div className="space-y-1 z-10">
                        <p className="text-lg font-serif font-bold text-neutral-700">
                            {isDragActive ? "Drop to upload" : "Click to upload banner"}
                        </p>
                        <p className="text-sm text-neutral-500">
                            or drag and drop your image file here
                        </p>
                    </div>

                    <div className="mt-4 px-3 py-1 bg-gold/10 text-gold text-xs font-bold rounded-full border border-gold/20">
                        Required: 851 x 315 px
                    </div>
                </div>
            )}

            {/* Premium Cropper Modal */}
            {showCropper && imageSrc && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-neutral-900 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">

                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                            <div className="flex items-center gap-2 text-white">
                                <ImageIcon className="w-5 h-5 text-gold" />
                                <h3 className="font-serif font-bold text-lg tracking-wide">Adjust Composition</h3>
                            </div>
                            <button onClick={() => setShowCropper(false)} className="text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Cropper Area */}
                        <div className="relative flex-1 bg-black w-full min-h-[400px]">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspectRatio}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                showGrid={true}
                                objectFit="contain" // Better visual for large images
                                style={{
                                    containerStyle: { background: "#000" },
                                    mediaStyle: {},
                                    cropAreaStyle: { border: "2px solid #C5A059", boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7)" }
                                }}
                            />
                        </div>

                        {/* Footer Controls */}
                        <div className="p-6 border-t border-white/10 bg-neutral-900 flex flex-col md:flex-row gap-6 items-center justify-between">
                            {/* Slack-like Zoom Control */}
                            <div className="flex items-center gap-4 w-full md:w-1/2">
                                <ZoomIn className="w-4 h-4 text-neutral-400" />
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="flex-1 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-gold hover:accent-amber-400 transition-all"
                                />
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => setShowCropper(false)}
                                    className="px-6 py-2.5 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <GoldenButton onClick={handleUpload} disabled={loading} className="min-w-[160px] py-2.5 shadow-gold/20 shadow-lg">
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4" /> Save Banner
                                        </div>
                                    )}
                                </GoldenButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

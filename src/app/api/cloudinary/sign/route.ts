import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export async function POST() {
  const body = {};
  // You can pass specific folder or transformations here if needed

  const timestamp = Math.round(new Date().getTime() / 1000);

  // Configure Cloudinary server-side
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: "banners", // Optional: Organize uploads
    },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return NextResponse.json({ signature, timestamp, folder: "banners" });
}

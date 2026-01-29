"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitKhidmatRequest(formData: FormData) {
  const miqat = formData.get("miqat") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const dateOn = formData.get("dateOn") as string;

  if (!miqat || !name || !phone || !dateOn) {
    return { error: "All fields are required" };
  }

  try {
    await prisma.khidmatRequest.create({
      data: {
        miqat,
        name,
        phone,
        date: new Date(dateOn),
      },
    });
    revalidatePath("/khidmat");
    return { success: true };
  } catch (error) {
    console.error("Failed to submit khidmat request:", error);
    return { error: "Failed to submit request" };
  }
}

export async function submitMemberRegistration(formData: FormData) {
  const title = formData.get("title") as string;
  const name = formData.get("name") as string;
  const its = formData.get("ITS") as string; // Match name in HTML
  const email = formData.get("email") as string;
  const dob = formData.get("dob") as string;
  const phone = formData.get("phone") as string;
  const quranHifz = formData.get("quranHifz") as string;
  const passport = formData.get("passport") as string;
  const kunSafar = formData.get("kunSafar") as string;
  const occupation = formData.get("occupation/interests") as string; // Match name in HTML
  const sports = formData.get("sports") as string;

  if (!name || !its || !email || !phone) {
    return { error: "Descriptive fields are required" };
  }

  try {
    await prisma.memberRegistration.create({
      data: {
        title,
        name,
        its,
        email,
        dob: new Date(dob),
        phone,
        quranHifz,
        passport,
        kunSafar,
        occupation,
        sports,
      },
    });
    revalidatePath("/join");
    return { success: true };
  } catch (error) {
    console.error("Failed to submit member registration:", error);
    return {
      error:
        "Failed to submit registration. ITS Number might already be registered.",
    };
  }
}

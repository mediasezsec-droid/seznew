"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createBlog(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const author = formData.get("author") as string;

  if (!title || !content || !author) {
    throw new Error("Missing required fields");
  }

  await prisma.blog.create({
    data: {
      title,
      content,
      author,
    },
  });

  revalidatePath("/admin/blogs");
  revalidatePath("/our-events");
}

export async function deleteBlog(id: string) {
  if (!id) return;
  await prisma.blog.delete({
    where: { id },
  });
  revalidatePath("/admin/blogs");
  revalidatePath("/our-events");
}

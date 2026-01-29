import { prisma } from "@/lib/db";
import { BannerCarousel } from "./BannerCarousel";

export async function TopBanner() {
    const banners = await prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
    });

    if (banners.length === 0) return null;

    return <BannerCarousel banners={banners} />;
}

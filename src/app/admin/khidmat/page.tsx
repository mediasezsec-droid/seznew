import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrnateHeading, OrnateCard } from "@/components/ui/premium-components";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default async function KhidmatAdminPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") redirect("/login");

    const requests = await prisma.khidmatRequest.findMany({
        orderBy: { createdAt: 'desc' }
    });
    return (
        <div className="min-h-screen bg-background-light py-12 px-6 mt-12">
            <div className="max-w-6xl mx-auto space-y-8">
                <OrnateHeading title="Khidmat Invitations" subtitle="Review and fulfill community requests" />

                <OrnateCard className="p-0 overflow-hidden border border-gold/20 shadow-2xl bg-white/90 backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-primary-dark/5 hover:bg-primary-dark/5 border-b border-primary/10">
                                    <TableHead className="py-5 px-8 text-primary-dark font-bold uppercase tracking-wider text-xs w-1/4">Event / Miqat</TableHead>
                                    <TableHead className="py-5 px-6 text-primary-dark font-bold uppercase tracking-wider text-xs">Host Details</TableHead>
                                    <TableHead className="py-5 px-6 text-primary-dark font-bold uppercase tracking-wider text-xs">Event Date</TableHead>
                                    <TableHead className="py-5 px-6 text-primary-dark font-bold uppercase tracking-wider text-xs text-right">Submitted Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-24 text-neutral-400">
                                            <p className="font-serif text-lg text-neutral-600 mb-1">No khidmat requests</p>
                                            <p className="text-sm">Invitations will appear here when submitted.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests.map((req) => (
                                        <TableRow key={req.id} className="hover:bg-gold/5 transition-colors border-b border-neutral-100 text-sm">
                                            <TableCell className="py-5 px-8">
                                                <span className="font-serif font-bold text-xl text-primary-dark block mb-1">{req.miqat}</span>
                                            </TableCell>
                                            <TableCell className="py-5 px-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-neutral-800 text-base">{req.name}</span>
                                                    <a href={`tel:${req.phone}`} className="font-mono text-neutral-500 text-xs tracking-wide hover:text-gold transition-colors">{req.phone}</a>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-neutral-800">{format(new Date(req.date), "EEEE, MMMM do, yyyy")}</span>
                                                    <span className="text-xs text-neutral-400">Event Date</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5 px-6 text-right">
                                                <span className="text-xs text-neutral-400 font-medium">Submitted on</span>
                                                <span className="block text-neutral-600 text-xs mt-0.5">{format(new Date(req.createdAt), "PP 'at' p")}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </OrnateCard>
            </div>
        </div>
    );
}

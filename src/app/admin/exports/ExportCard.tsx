"use client";

import { useState } from "react";
import { OrnateCard } from "@/components/ui/premium-components";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileSpreadsheet, Users, FileText, Calendar, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import { getExportData } from "@/app/actions/exports";
import * as XLSX_BASIC from "xlsx";
import XLSX from "xlsx-js-style";
import toast from "react-hot-toast";

interface ExportCardProps {
    title: string;
    description: string;
    type: string; // USERS, ACCOUNTS, etc.
}

export function ExportCard({ title, description, type }: ExportCardProps) {
    const [loading, setLoading] = useState(false);

    // Icon mapping
    const IconMap: Record<string, React.ElementType> = {
        USERS: Users,
        ACCOUNTS: Wallet,
        PENDING_FEES: AlertCircle,
        PAID_HISTORY: CheckCircle2,
        EVENTS: Calendar,
        CONTRIBUTIONS: FileText
    };
    const Icon = IconMap[type] || FileSpreadsheet;

    const handleDownload = async () => {
        console.log(`[Export:START] Initiating export for type: ${type}`);
        setLoading(true);
        try {
            const res = await getExportData(type);

            if (!res.success || !res.data || res.data.length === 0) {
                toast.error(res.error || "No data available to export");
                setLoading(false);
                return;
            }

            // Generate Excel
            const worksheet = XLSX.utils.json_to_sheet(res.data, {
                header: res.headers // Use server-provided headers if available for correct column ordering
            });
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

            // STYLING
            if (type === "PENDING_FEES" && worksheet['!ref']) {
                const range = XLSX.utils.decode_range(worksheet['!ref']);
                // Headers (Row 0)
                // Content (Row 1+)
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    // Check header name to identify columns
                    const headerAddress = XLSX.utils.encode_cell({ r: 0, c: C });
                    const headerCell = worksheet[headerAddress];
                    const headerVal = headerCell ? headerCell.v : "";

                    // Style Header
                    if (headerCell) {
                        headerCell.s = {
                            font: { bold: true, color: { rgb: "000000" } },
                            fill: { fgColor: { rgb: "EFEFEF" } },
                            alignment: { horizontal: "center" },
                            border: { bottom: { style: "thin", color: { rgb: "000000" } } }
                        };
                    }

                    const isAmountCol = headerVal !== "User Name" && headerVal !== "ITS";

                    for (let R = 1; R <= range.e.r; ++R) {
                        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                        if (!worksheet[cellAddress]) continue; // Skip empty

                        const cell = worksheet[cellAddress];

                        // Style Amount Cells
                        if (isAmountCol && typeof cell.v === 'number') {
                            if (cell.v > 0) {
                                // Red for Due
                                cell.s = {
                                    fill: { fgColor: { rgb: "FFC7CE" } }, // Light Red
                                    font: { color: { rgb: "9C0006" } }   // Dark Red text
                                };
                            } else {
                                // Green for Clear (0)
                                cell.s = {
                                    fill: { fgColor: { rgb: "C6EFCE" } }, // Light Green
                                    font: { color: { rgb: "006100" } }   // Dark Green text
                                };
                            }
                        }
                    }
                }
            }

            // Format Columns
            if (res.headers) {
                // Custom widths for pivoted data
                worksheet["!cols"] = res.headers.map(h => {
                    if (h === "User Name") return { wch: 30 };
                    if (h === "Total Due") return { wch: 15 };
                    if (h === "ITS") return { wch: 12 };
                    return { wch: 12 }; // Month columns
                });
            } else {
                // Default auto width for other exports
                // Simple estimation: look at first row keys or just set a default
                const keys = Object.keys(res.data[0] || {});
                worksheet["!cols"] = keys.map(() => ({ wch: 20 }));
            }

            // Download
            XLSX.writeFile(workbook, `sez_${type.toLowerCase()}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
            console.log(`[Export:SUCCESS] Export completed for ${type}. Rows: ${res.data.length}`);
            toast.success(`${title} exported successfully`);

        } catch (error) {
            console.error(`[Export:ERROR] Failed to export ${type}:`, error);
            toast.error("Failed to generate export");
        }
        setLoading(false);
    };

    return (
        <OrnateCard className="h-full flex flex-col justify-between hover:shadow-xl transition-all duration-300 group bg-white border-gold/20 relative overflow-hidden">
            <div className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                    <div className="p-3 bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl text-gold-dark group-hover:bg-gold group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md">
                        <Icon className="w-8 h-8" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-2xl font-serif font-bold text-primary-dark group-hover:text-gold-dark transition-colors">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>

            <div className="p-8 pt-0 mt-auto">
                <Button
                    onClick={handleDownload}
                    disabled={loading}
                    className="w-full h-12 text-base font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gold hover:text-white hover:border-gold transition-all shadow-sm hover:shadow-md rounded-xl"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                        <Download className="w-5 h-5 mr-2" />
                    )}
                    {loading ? "Generating..." : "Download Excel"}
                </Button>
            </div>
        </OrnateCard>
    );
}

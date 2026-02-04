"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export interface AccountsOverview {
  totalCollections: number;
  totalPendingFees: number;
  totalPendingEvents: number;
  todayCollection: number; // Transactions today
}

export interface MemberFinancial {
  userId: string;
  username: string;
  name: string | null;
  mobile: string | null;
  totalDue: number; // Monthly + Events
  totalPaid: number; // Monthly + Events
  balance: number; // Net Outstanding
}

// ----------------------------------------------------------------------
// Actions
// ----------------------------------------------------------------------

/**
 * Get high-level statistics for the accounts dashboard
 */
export async function getAccountsOverview() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    // 1. Calculate Monthly Fee Totals
    const feeStats = await prisma.feeRecord.aggregate({
      _sum: {
        amount: true,
        paidAmount: true,
      },
    });

    const totalFeeDue =
      (feeStats._sum.amount || 0) - (feeStats._sum.paidAmount || 0);

    // 2. Calculate Event Contribution Totals
    const eventStats = await prisma.eventContribution.aggregate({
      _sum: {
        amount: true,
        paidAmount: true,
      },
    });

    const totalEventDue =
      (eventStats._sum.amount || 0) - (eventStats._sum.paidAmount || 0);

    // 3. Total Collections (All Time)
    const totalCollections =
      (feeStats._sum.paidAmount || 0) + (eventStats._sum.paidAmount || 0);

    // 4. Today's Collections
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaysTransactions = await prisma.feeTransaction.aggregate({
      where: {
        date: {
          gte: startOfDay,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const data: AccountsOverview = {
      totalCollections,
      totalPendingFees: totalFeeDue,
      totalPendingEvents: totalEventDue,
      todayCollection: todaysTransactions._sum.amount || 0,
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching accounts overview:", error);
    return { success: false, error: "Failed to fetch overview" };
  }
}

/**
 * Get list of all transactions sorted by date desc
 */
export async function getAllTransactions() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const transactions = await prisma.feeTransaction.findMany({
      take: 100, // Limit to recent 100 transactions to prevent crash
      orderBy: { date: "desc" },
      include: {
        user: {
          select: {
            username: true,
            name: true,
          },
        },
        allocations: {
          include: {
            feeRecord: true,
            eventContribution: true,
          },
        },
      },
    });

    return { success: true, data: transactions };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { success: false, error: "Failed to fetch transactions" };
  }
}

/**
 * Get financial standing of all members
 */
export async function getMemberFinancials() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    // Fetch all users with their fee records and event contributions
    const users = await prisma.user.findMany({
      where: {
        // Removed role filter to include everyone including admins
      },
      take: 500, // Limit to 500 to prevent Vercel timeout/payload limits
      orderBy: { name: "asc" },
      select: {
        id: true,
        username: true,
        name: true,
        mobile: true,
        feeRecords: {
          select: { amount: true, paidAmount: true },
        },
        eventContributions: {
          select: { amount: true, paidAmount: true },
        },
      },
    });

    const members: MemberFinancial[] = users.map((user) => {
      const feeDue = user.feeRecords.reduce((sum, f) => sum + f.amount, 0);
      const feePaid = user.feeRecords.reduce((sum, f) => sum + f.paidAmount, 0);

      const eventDue = user.eventContributions.reduce(
        (sum, e) => sum + e.amount,
        0,
      );
      const eventPaid = user.eventContributions.reduce(
        (sum, e) => sum + e.paidAmount,
        0,
      );

      const totalDue = feeDue + eventDue;
      const totalPaid = feePaid + eventPaid;

      return {
        userId: user.id,
        username: user.username,
        name: user.name,
        mobile: user.mobile,
        totalDue,
        totalPaid,
        balance: totalDue - totalPaid,
      };
    });

    // Sort: Alphabetically by Name (A-Z)
    members.sort((a, b) => {
      const nameA = a.name || a.username;
      const nameB = b.name || b.username;
      return nameA.localeCompare(nameB);
    });

    return { success: true, data: members };
  } catch (error) {
    console.error("Error fetching member financials:", error);
    return { success: false, error: "Failed to fetch members" };
  }
}

/**
 * Get all monthly fee records formatted for table
 */
export async function getAllFeeRecords() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const fees = await prisma.feeRecord.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: {
        user: {
          select: { username: true, name: true },
        },
      },
    });
    return { success: true, data: fees };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed fees" };
  }
}

export async function getAllEventContributions() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const events = await prisma.eventContribution.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { username: true, name: true },
        },
      },
    });
    return { success: true, data: events };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed events" };
  }
}

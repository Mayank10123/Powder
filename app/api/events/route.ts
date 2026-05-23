import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/events
 * Get real-time events stream (SSE-friendly)
 * Query params:
 * - since: ISO timestamp (only events after this time)
 * - providerId: filter by provider
 */
export async function GET(request: NextRequest) {
  try {
    const since = request.nextUrl.searchParams.get("since");
    const providerId = request.nextUrl.searchParams.get("providerId");

    const whereClause: any = {};

    if (since) {
      whereClause.createdAt = { gt: new Date(since) };
    }

    if (providerId) {
      whereClause.providerId = parseInt(providerId);
    }

    const events = await prisma.leadAssignmentEvent.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ events }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}

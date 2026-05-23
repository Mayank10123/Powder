import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/providers
 * Get all providers with their quota and assignments
 */
export async function GET(request: NextRequest) {
  try {
    const providerId = request.nextUrl.searchParams.get("id");

    if (providerId) {
      // Get specific provider
      const provider = await prisma.provider.findUnique({
        where: { id: parseInt(providerId) },
        include: {
          assignments: {
            include: {
              lead: {
                include: {
                  service: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          quotaResets: {
            orderBy: { processedAt: "desc" },
            take: 10,
          },
        },
      });

      if (!provider) {
        return NextResponse.json(
          { error: "Provider not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          provider: {
            ...provider,
            remainingQuota: provider.monthlyQuota - provider.leadsReceivedCount,
          },
        },
        { status: 200 }
      );
    }

    // Get all providers
    const providers = await prisma.provider.findMany({
      include: {
        assignments: {
          include: {
            lead: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(
      {
        providers: providers.map((p) => ({
          ...p,
          remainingQuota: p.monthlyQuota - p.leadsReceivedCount,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching providers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch providers" },
      { status: 500 }
    );
  }
}

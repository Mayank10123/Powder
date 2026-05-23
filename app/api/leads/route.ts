import { prisma } from "@/lib/prisma";
import { allocateLead } from "@/lib/allocation";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/leads
 * Create a new lead and trigger allocation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phoneNumber, city, serviceId, description } = body;

    // Validate required fields
    if (!name || !phoneNumber || !city || !serviceId || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for duplicate: same phone number + service
    const existing = await prisma.lead.findUnique({
      where: {
        phoneNumber_serviceId: {
          phoneNumber,
          serviceId: parseInt(serviceId),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Duplicate lead: same phone number already submitted for this service",
        },
        { status: 409 }
      );
    }

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        name,
        phoneNumber,
        city,
        serviceId: parseInt(serviceId),
        description,
      },
    });

    // Trigger allocation
    let allocationResult;
    try {
      allocationResult = await allocateLead(lead.id, parseInt(serviceId));
    } catch (allocationError: any) {
      // If allocation fails, delete the lead
      await prisma.lead.delete({ where: { id: lead.id } });
      return NextResponse.json(
        { error: `Allocation failed: ${allocationError.message}` },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        lead,
        allocation: allocationResult,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create lead" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads
 * Get all leads (optionally filtered by service or provider)
 */
export async function GET(request: NextRequest) {
  try {
    const serviceId = request.nextUrl.searchParams.get("serviceId");
    const providerId = request.nextUrl.searchParams.get("providerId");

    let whereClause: any = {};

    if (serviceId) {
      whereClause.serviceId = parseInt(serviceId);
    }

    let leads: any = await prisma.lead.findMany({
      where: whereClause,
      include: {
        service: true,
        assignments: {
          include: {
            provider: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter by provider if specified
    if (providerId) {
      const pId = parseInt(providerId);
      leads = leads.filter((lead: any) =>
        lead.assignments.some((a: any) => a.providerId === pId)
      );
    }

    return NextResponse.json({ leads }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

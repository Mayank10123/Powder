import { prisma } from "@/lib/prisma";
import { resetProviderQuota, resetAllProviderQuotas } from "@/lib/allocation";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

/**
 * POST /api/webhook/quota-reset
 * Webhook endpoint to reset provider quota (idempotent)
 * Required params: providerId (optional, if not provided resets all)
 * Required header: X-Webhook-Id (for idempotency)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId } = body;

    // Get idempotency key from header or generate one
    let webhookId =
      request.headers.get("X-Webhook-Id") || randomUUID();

    if (!webhookId) {
      return NextResponse.json(
        { error: "Missing X-Webhook-Id header for idempotency" },
        { status: 400 }
      );
    }

    let result;

    if (providerId) {
      // Reset specific provider
      result = await resetProviderQuota(parseInt(providerId), webhookId);
    } else {
      // Reset all providers
      await resetAllProviderQuotas(webhookId);
      result = true;
    }

    return NextResponse.json(
      {
        success: result,
        message: providerId
          ? `Quota reset for provider ${providerId}`
          : "All provider quotas reset",
        webhookId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in quota reset webhook:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset quota" },
      { status: 500 }
    );
  }
}

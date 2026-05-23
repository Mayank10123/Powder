import { prisma } from "./prisma";

/**
 * Fair allocation logic:
 * - Service 1 requires: Provider 1 (mandatory)
 *   - Fair pool: Providers 2, 3, 4
 * - Service 2 requires: Provider 5 (mandatory)
 *   - Fair pool: Providers 6, 7, 8
 * - Service 3 requires: Providers 1 & 4 (mandatory)
 *   - Fair pool: Providers 2, 3, 5, 6, 7, 8
 * Each lead gets exactly 3 providers total
 */

export interface AllocationConfig {
  mandatoryProviders: number[];
  fairPool: number[];
  requiredCount: number;
}

export interface AllocationResult {
  leadId: string;
  assignedProviders: number[];
  mandatoryProviders: number[];
  fairProviders: number[];
}

// Allocation configurations per service
const ALLOCATION_CONFIGS: Record<number, AllocationConfig> = {
  1: {
    mandatoryProviders: [1], // Service 1 → Provider 1 must always receive
    fairPool: [2, 3, 4],
    requiredCount: 3, // Total providers for this lead
  },
  2: {
    mandatoryProviders: [5], // Service 2 → Provider 5 must always receive
    fairPool: [6, 7, 8],
    requiredCount: 3,
  },
  3: {
    mandatoryProviders: [1, 4], // Service 3 → Providers 1 & 4 must always receive
    fairPool: [2, 3, 5, 6, 7, 8],
    requiredCount: 3,
  },
};

/**
 * Main lead allocation function
 * Called after a new lead is created
 */
export async function allocateLead(
  leadId: string,
  serviceId: number
): Promise<AllocationResult> {
  const config = ALLOCATION_CONFIGS[serviceId];
  if (!config) {
    throw new Error(`Invalid service ID: ${serviceId}`);
  }

  // Fetch all providers with their current quota usage
  const providers = await prisma.provider.findMany({
    select: {
      id: true,
      leadsReceivedCount: true,
      monthlyQuota: true,
      service1RoundRobinIndex: true,
      service2RoundRobinIndex: true,
      service3RoundRobinIndex: true,
    },
  });

  const providerMap = new Map(providers.map((p) => [p.id, p]));

  // Step 1: Check which mandatory providers can accept (haven't hit quota)
  const availableMandatory = config.mandatoryProviders.filter((pid) => {
    const provider = providerMap.get(pid);
    return provider && provider.leadsReceivedCount < provider.monthlyQuota;
  });

  // Step 2: If not all mandatory providers available, allocation fails
  if (availableMandatory.length < config.mandatoryProviders.length) {
    throw new Error(
      `Cannot allocate lead: mandatory providers for service ${serviceId} are at quota`
    );
  }

  // Step 3: Assign mandatory providers
  const assignedProviders: number[] = [...availableMandatory];

  // Step 4: Fair allocation - select from fair pool
  const requiredFromFair =
    config.requiredCount - config.mandatoryProviders.length;
  const fairProviders = selectFairProviders(
    config.fairPool,
    requiredFromFair,
    providerMap,
    serviceId
  );

  assignedProviders.push(...fairProviders);

  // Step 5: Persist assignments to database
  for (const providerId of assignedProviders) {
    await prisma.providerAssignment.create({
      data: {
        leadId,
        providerId,
      },
    });

    // Increment provider's leads received count
    await prisma.provider.update({
      where: { id: providerId },
      data: { leadsReceivedCount: { increment: 1 } },
    });

    // Log real-time event
    await prisma.leadAssignmentEvent.create({
      data: {
        leadId,
        providerId,
        eventType: "assigned",
        payload: JSON.stringify({
          leadId,
          providerId,
          serviceId,
          timestamp: new Date().toISOString(),
        }),
      },
    });
  }

  return {
    leadId,
    assignedProviders,
    mandatoryProviders: availableMandatory,
    fairProviders,
  };
}

/**
 * Fair provider selection using round-robin
 * This ensures providers are selected fairly over time
 */
function selectFairProviders(
  fairPool: number[],
  count: number,
  providerMap: Map<number, any>,
  serviceId: number
): number[] {
  const selected: number[] = [];
  const availableFromPool = fairPool
    .map((pid) => providerMap.get(pid))
    .filter((p) => p && p.leadsReceivedCount < p.monthlyQuota);

  if (availableFromPool.length < count) {
    throw new Error(
      `Not enough available providers in fair pool for service ${serviceId}`
    );
  }

  // Round-robin based on serviceId and current index
  const roundRobinKey =
    serviceId === 1
      ? "service1RoundRobinIndex"
      : serviceId === 2
        ? "service2RoundRobinIndex"
        : "service3RoundRobinIndex";

  // Sort by round-robin index to ensure fairness
  availableFromPool.sort((a, b) => {
    const aIndex = a[roundRobinKey] || 0;
    const bIndex = b[roundRobinKey] || 0;
    return aIndex - bIndex;
  });

  // Select top `count` providers
  for (let i = 0; i < count; i++) {
    selected.push(availableFromPool[i].id);
  }

  // Update round-robin indices for next allocation
  // This ensures fairness over time
  for (const provider of selected) {
    prisma.provider
      .update({
        where: { id: provider },
        data: { [roundRobinKey]: { increment: 1 } },
      })
      .catch(console.error); // Fire and forget
  }

  return selected;
}

/**
 * Reset provider quota through webhook (idempotent)
 * @param providerId Provider ID
 * @param webhookId Unique identifier for this webhook call (idempotency key)
 */
export async function resetProviderQuota(
  providerId: number,
  webhookId: string
): Promise<boolean> {
  // Check if this webhook has already been processed (idempotency)
  const existing = await prisma.quotaReset.findUnique({
    where: { webhookId },
  });

  if (existing) {
    // Already processed - return success without doing anything
    console.log(`Webhook ${webhookId} already processed, skipping`);
    return true;
  }

  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { leadsReceivedCount: true, monthlyQuota: true },
  });

  if (!provider) {
    throw new Error(`Provider ${providerId} not found`);
  }

  // Record the quota reset for idempotency
  await prisma.quotaReset.create({
    data: {
      providerId,
      webhookId,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      previousQuota: provider.leadsReceivedCount,
      newQuota: 10,
    },
  });

  // Reset the quota
  await prisma.provider.update({
    where: { id: providerId },
    data: { leadsReceivedCount: 0 },
  });

  // Log the event
  await prisma.leadAssignmentEvent.create({
    data: {
      leadId: "WEBHOOK",
      providerId,
      eventType: "quota_reset",
      payload: JSON.stringify({
        providerId,
        webhookId,
        newQuota: 10,
        timestamp: new Date().toISOString(),
      }),
    },
  });

  return true;
}

export async function resetAllProviderQuotas(webhookId: string): Promise<void> {
  // Check if this webhook call was already processed
  const existingResets = await prisma.quotaReset.findMany({
    where: { webhookId },
  });

  if (existingResets.length > 0) {
    console.log(`Bulk webhook ${webhookId} already processed, skipping`);
    return;
  }

  const providers = await prisma.provider.findMany();

  for (const provider of providers) {
    await resetProviderQuota(provider.id, `${webhookId}-${provider.id}`);
  }
}

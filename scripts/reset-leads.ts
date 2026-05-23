import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetLeads() {
  try {
    console.log('Resetting database...');
    
    // Delete all provider assignments
    const deletedAssignments = await prisma.providerAssignment.deleteMany();
    console.log(`✓ Deleted ${deletedAssignments.count} provider assignments`);
    
    // Delete all lead assignment events
    const deletedEvents = await prisma.leadAssignmentEvent.deleteMany();
    console.log(`✓ Deleted ${deletedEvents.count} lead assignment events`);
    
    // Delete all leads
    const deletedLeads = await prisma.lead.deleteMany();
    console.log(`✓ Deleted ${deletedLeads.count} leads`);
    
    // Reset provider quotas and round-robin indices
    const resetProviders = await prisma.provider.updateMany({
      data: {
        leadsReceivedCount: 0,
        service1RoundRobinIndex: 0,
        service2RoundRobinIndex: 0,
        service3RoundRobinIndex: 0,
      },
    });
    console.log(`✓ Reset ${resetProviders.count} providers`);
    
    console.log('\n✅ Database reset complete!');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetLeads();

import { getPrismaClient } from '../../src/db/prisma';

export function assertIntegrationDbSafety(): void {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim();
  const activeDatabaseUrl = process.env.DATABASE_URL?.trim();

  if (!testDatabaseUrl) {
    throw new Error('TEST_DATABASE_URL is required for integration tests.');
  }

  if (!activeDatabaseUrl || activeDatabaseUrl !== testDatabaseUrl) {
    throw new Error('DATABASE_URL must be set to TEST_DATABASE_URL for integration tests.');
  }

  if (!/test/i.test(testDatabaseUrl) && process.env.ALLOW_INTEGRATION_DB_RESET !== '1') {
    throw new Error('Refusing to run integration tests: TEST_DATABASE_URL does not look like a test database.');
  }
}

export async function resetIntegrationDb(): Promise<void> {
  const prisma = getPrismaClient();

  await prisma.$transaction([
    prisma.challengeCheckIn.deleteMany(),
    prisma.reaction.deleteMany(),
    prisma.post.deleteMany(),
    prisma.notificationDispatchLog.deleteMany(),
    prisma.userNotificationSettings.deleteMany(),
    prisma.challengeParticipation.deleteMany(),
    prisma.challenge.deleteMany(),
    prisma.communityGroup.deleteMany(),
    prisma.purchase.deleteMany(),
    prisma.product.deleteMany(),
    prisma.user.deleteMany()
  ]);
}

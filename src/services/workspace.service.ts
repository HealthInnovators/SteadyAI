import { getPrismaClient } from '../db/prisma';
import { UserRole, type Workspace, type WorkspaceMember } from '@prisma/client';

export async function resolveUserWorkspace(userId: string): Promise<{ workspace: Workspace; membership: WorkspaceMember }> {
  const prisma = getPrismaClient();

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
  });

  if (membership) {
    return { workspace: membership.workspace, membership };
  }

  // Backfill for existing user: create a personal workspace
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, displayName: true } });
  if (!user) {
    throw new Error('User not found for workspace resolution');
  }

  const personalWorkspace = await prisma.workspace.create({
    data: {
      name: `${user.displayName || 'User'}'s Personal Space`,
      ownerId: userId,
    },
  });

  const newMembership = await prisma.workspaceMember.create({
    data: {
      userId,
      workspaceId: personalWorkspace.id,
      role: UserRole.MEMBER,
    },
  });

  return { workspace: personalWorkspace, membership: newMembership };
}

export function hasRequiredRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    if (requiredRoles.length === 0) {
        return true;
    }
    return requiredRoles.includes(userRole);
}

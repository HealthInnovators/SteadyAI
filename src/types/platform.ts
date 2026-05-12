import { UserRole } from '@prisma/client';

export interface PlatformContext {
  userIdentity: {
    id: string;
    email: string | undefined;
    displayName: string | null | undefined;
    onboardingCompleted: boolean;
  };
  workspace: {
    id: string;
    name: string;
    role: UserRole;
  };
  enabledModules: string[];
}

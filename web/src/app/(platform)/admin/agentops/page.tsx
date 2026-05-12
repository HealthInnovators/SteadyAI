'use client';

import { usePlatformContext } from "@/features/platform/PlatformProvider";
import { UserRole } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AgentRunsTable } from "@/features/admin/components/AgentRunsTable";

export default function AgentOpsAdminPage() {
    const { workspace, isLoading } = usePlatformContext();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && workspace.role !== UserRole.ADMIN) {
            router.replace('/');
        }
    }, [isLoading, workspace.role, router]);

    if (isLoading || workspace.role !== UserRole.ADMIN) {
        return <div className="p-6 text-center">Loading admin dashboard...</div>;
    }

    return (
        <div className="p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-[#1d140d]">AgentOps Admin</h1>
                <p className="text-base text-[#5f5145]">Monitor and debug system-wide agent activity.</p>
            </header>
            <AgentRunsTable />
        </div>
    );
}

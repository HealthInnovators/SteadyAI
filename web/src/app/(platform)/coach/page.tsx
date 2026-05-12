'use client';

import { usePlatformContext } from "@/features/platform/PlatformProvider";
import { FeedbackQueueCard } from "@/features/coach/components/FeedbackQueueCard";
import { MemberReviewQueueCard } from "@/features/coach/components/MemberReviewQueueCard";
import { CoachingInsightsCard } from "@/features/coach/components/CoachingInsightsCard";
import { UserRole } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CoachPage() {
    const { workspace, isLoading } = usePlatformContext();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && workspace.role !== UserRole.COACH && workspace.role !== UserRole.ADMIN) {
            router.replace('/');
        }
    }, [isLoading, workspace.role, router]);

    if (isLoading || (workspace.role !== UserRole.COACH && workspace.role !== UserRole.ADMIN)) {
        return <div className="p-6 text-center">Loading coach dashboard...</div>;
    }

    return (
        <div className="p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-[#1d140d]">Coach Dashboard</h1>
                <p className="text-base text-[#5f5145]">Your central hub for managing clients and providing feedback.</p>
            </header>
            <div className="space-y-8">
                <MemberReviewQueueCard />
                <FeedbackQueueCard />
                <CoachingInsightsCard />
            </div>
        </div>
    );
}

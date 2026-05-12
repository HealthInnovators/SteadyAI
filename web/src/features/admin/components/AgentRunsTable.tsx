'use client';

import { createApiClient } from '@/lib/api';
import { useAuth } from '@/auth';
import { useEffect, useMemo, useState } from 'react';
import type { AgentRun, AgentEvent, AgentDefinition } from '@prisma/client';

// Simplified representation of the AgentRun type returned by our API
interface AgentRunData extends AgentRun {
    agentDefinition: AgentDefinition;
    events: AgentEvent[];
}

function RunRow({ run }: { run: AgentRunData }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <tr className="border-b border-gray-100 cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(!expanded)}>
                <td className="p-4 text-sm">{run.agentDefinition.agentId}</td>
                <td className="p-4 text-sm">{run.status}</td>
                <td className="p-4 text-sm">{new Date(run.startedAt).toLocaleString()}</td>
                <td className="p-4 text-sm">{run.endedAt ? Math.round((new Date(run.endedAt).getTime() - new Date(run.startedAt).getTime()) / 1000) + 's' : 'In Progress'}</td>
            </tr>
            {expanded && (
                <tr>
                    <td colSpan={4} className="p-4 bg-gray-50">
                        <div className="text-xs font-mono">
                            <p className="font-semibold mb-2">Events:</p>
                            {run.events.map(event => (
                                <div key={event.id} className="mb-1">[{new Date(event.createdAt).toLocaleTimeString()}] {event.type}</div>
                            ))}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

export function AgentRunsTable() {
    const { token } = useAuth();
    const api = useMemo(() => createApiClient(token ?? undefined), [token]);
    const [runs, setRuns] = useState<AgentRunData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRuns() {
            try {
                const response = await api.get<AgentRunData[]>('/api/admin/agentops/runs');
                setRuns(response);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchRuns();
    }, [api]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="p-4 text-sm font-semibold">Agent</th>
                        <th className="p-4 text-sm font-semibold">Status</th>
                        <th className="p-4 text-sm font-semibold">Started</th>
                        <th className="p-4 text-sm font-semibold">Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {runs.map(run => <RunRow key={run.id} run={run} />)}
                </tbody>
            </table>
        </div>
    );
}

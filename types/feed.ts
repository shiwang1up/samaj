// ─── Feed Domain Types ────────────────────────────────────────
// Single source of truth for all feed-related shapes.
// UI components depend on these abstractions, not on raw data blobs.

export const FEED_SCOPES = ['Colony', 'District', 'State'] as const;
export type FeedScope = (typeof FEED_SCOPES)[number];

// ── Status ────────────────────────────────────────────────────
export type IssueStatus = 'UNRESOLVED' | 'IN PROGRESS' | 'RESOLVED';

// ── Issue (citizen-reported civic problem) ────────────────────
export interface IIssue {
    id: string;
    status: IssueStatus;
    time: string;
    title: string;
    body: string;
    imageUri: string;
    supporters: number;
    supporterColors: string[];
}

// ── Official Update (from council / authority) ────────────────
export interface IUpdate {
    id: string;
    author: string;
    authorBadge: string;
    time: string;
    status: IssueStatus;
    title: string;
    body: string;
    imageUri: string;
    commentCount: number;
}

// ── Colony Health stats ────────────────────────────────────────
export interface IColonyHealth {
    resolvedThisMonth: number;
    activeIssues: number;
}

// ── Advocate ───────────────────────────────────────────────────
export interface IAdvocate {
    id: string;
    name: string;
    reportCount: number;
    avatarColor: string;
}

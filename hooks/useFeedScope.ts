// ─── useFeedScope ─────────────────────────────────────────────
// Encapsulates feed scope (Colony / District / State) selection.
// SRP: the screen component is not responsible for filter state.

import { useState } from 'react';
import { FEED_SCOPES, type FeedScope } from '../types/feed';

export interface UseFeedScopeReturn {
    scopes: typeof FEED_SCOPES;
    activeScope: FeedScope;
    setScope: (scope: FeedScope) => void;
}

export function useFeedScope(): UseFeedScopeReturn {
    const [activeScope, setActiveScope] = useState<FeedScope>('Colony');

    return {
        scopes: FEED_SCOPES,
        activeScope,
        setScope: setActiveScope,
    };
}

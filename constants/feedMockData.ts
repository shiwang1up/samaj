// ─── Feed Mock Data ───────────────────────────────────────────
// Isolated data layer. Conforms to domain types so swapping to a
// real API endpoint only requires replacing this module.

import type { IAdvocate, IColonyHealth, IIssue, IUpdate } from '../types/feed';
import type { IStory } from '../components/feed/StoryReel';

export const MOCK_STORIES: IStory[] = [
    { id: 's1', label: 'Ramesh K.',     initial: 'R', avatarColor: '#1d324e', hasUnseen: true },
    { id: 's2', label: 'Anita S.',      initial: 'A', avatarColor: '#5a6332', hasUnseen: true },
    { id: 's3', label: 'District Lead', initial: '🏛', avatarColor: '#dce5db', hasUnseen: false },
    { id: 's4', label: 'City Council',  initial: 'C', avatarColor: '#526070', hasUnseen: true },
    { id: 's5', label: 'Priya M.',      initial: 'P', avatarColor: '#344966', hasUnseen: false },
];

export const MOCK_ISSUE: IIssue = {
    id: '1',
    status: 'UNRESOLVED',
    time: '2 hrs ago',
    title: 'Hazardous Broken Streetlight on Oak Avenue',
    body: 'The streetlight near intersection 4 has completely fallen over onto the sidewalk. It is creating a safety hazard for pedestrians and cyclists.',
    imageUri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    supporters: 12,
    supporterColors: ['#1d324e', '#5a6332', '#526070'],
};

export const MOCK_UPDATE: IUpdate = {
    id: '2',
    author: 'Ward 4 Council',
    authorBadge: 'Official Update',
    time: '1 day ago',
    status: 'IN PROGRESS',
    title: 'Pothole Repair on Maple Street Initiated',
    body: 'Following the community petition last week, public works crews have begun assessing and filling the major potholes on Maple Street. Expected completion by Thursday evening.',
    imageUri: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&q=80',
    commentCount: 24,
};

export const MOCK_COLONY_HEALTH: IColonyHealth = {
    resolvedThisMonth: 18,
    activeIssues: 5,
};

export const MOCK_ADVOCATES: IAdvocate[] = [
    { id: '1', name: 'Ramesh K.', reportCount: 37, avatarColor: '#1d324e' },
    { id: '2', name: 'Anita S.',  reportCount: 28, avatarColor: '#5a6332' },
];

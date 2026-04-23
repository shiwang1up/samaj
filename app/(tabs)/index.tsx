import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AdvocateRow }       from '../../components/feed/AdvocateRow';
import { ColonyHealthCard }  from '../../components/feed/ColonyHealthCard';
import { IssueCard }         from '../../components/feed/IssueCard';
import { ReportCTACard }     from '../../components/feed/ReportCTACard';
import { ScopeTabs }         from '../../components/feed/ScopeTabs';
import { StoryReel }         from '../../components/feed/StoryReel';
import { UpdateCard }        from '../../components/feed/UpdateCard';
import { TopBar }            from '../../components/common/TopBar';

import {
    MOCK_ADVOCATES,
    MOCK_COLONY_HEALTH,
    MOCK_ISSUE,
    MOCK_STORIES,
    MOCK_UPDATE,
} from '../../constants/feedMockData';

import { useFeedScope }  from '../../hooks/useFeedScope';
import { useLogout }     from '../../hooks/useLogout';

export default function HomeScreen() {
    const { theme }               = useUnistyles();
    const router                  = useRouter();
    const { logout }              = useLogout();
    const { scopes, activeScope, setScope } = useFeedScope();

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <View style={styles.root}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Navigation bar ── */}
                <TopBar onAvatarPress={handleLogout} />

                {/* ── Stories ── */}
                <StoryReel
                    stories={MOCK_STORIES}
                    onAddStory={() => console.log('add story')}
                    onStoryPress={(s) => console.log('story', s.id)}
                />

                {/* ── Page title ── */}
                <View style={styles.pageTitleBlock}>
                    <Text style={[styles.pageTitle, { color: theme.colors.on_surface }]}>
                        Community Feed
                    </Text>
                    <Text style={[styles.pageSubtitle, { color: theme.colors.on_surface_variant }]}>
                        Local issues, updates, and civic engagement.
                    </Text>
                </View>

                {/* ── Scope filter ── */}
                <ScopeTabs
                    scopes={scopes}
                    activeScope={activeScope}
                    onSelect={setScope}
                />

                {/* ── Feed cards ── */}
                <View style={styles.feedPadding}>
                    <IssueCard
                        issue={MOCK_ISSUE}
                        onUpvote={(id) => console.log('upvote', id)}
                    />
                    <UpdateCard
                        update={MOCK_UPDATE}
                        onJoinDiscussion={(id) => console.log('join', id)}
                    />
                </View>

                {/* ── Colony health ── */}
                <View style={styles.feedPadding}>
                    <ColonyHealthCard health={MOCK_COLONY_HEALTH} />
                </View>

                {/* ── Report CTA ── */}
                <View style={styles.feedPadding}>
                    <ReportCTACard onReport={() => router.push('/report')} />
                </View>

                {/* ── Top Advocates ── */}
                <View style={[styles.section, { backgroundColor: theme.colors.surface_container_low }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.on_surface }]}>
                        Top Advocates
                    </Text>
                    <View style={{ gap: theme.spacing.xs }}>
                        {MOCK_ADVOCATES.map((advocate) => (
                            <AdvocateRow key={advocate.id} advocate={advocate} />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    root: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    scroll: {
        paddingBottom: theme.spacing['3xl'],
    },

    // Page title block
    pageTitleBlock: {
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.base,
        gap: 4,
    },
    pageTitle: {
        fontSize: theme.typography.sizes.headline_md,
        fontWeight: theme.typography.weights.extrabold,
        letterSpacing: theme.typography.tracking.headline,
    },
    pageSubtitle: {
        fontSize: theme.typography.sizes.body_sm,
    },

    // Feed card wrapper (horizontal inset)
    feedPadding: {
        paddingHorizontal: theme.spacing.xl,
    },

    // Generic section box
    section: {
        marginHorizontal: theme.spacing.xl,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.xl,
        marginBottom: theme.spacing.base,
    },
    sectionTitle: {
        fontSize: theme.typography.sizes.title_md,
        fontWeight: theme.typography.weights.bold,
        marginBottom: theme.spacing.base,
    },
}));

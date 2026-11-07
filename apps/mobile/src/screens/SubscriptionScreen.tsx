import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '@recallr/tokens';
import { Card, OrangeCorner, ProgressBar, PressableScale, Skeleton } from '../components/ui';
import {
  IconArrowLeft,
  IconChevronRight,
  IconExternalLink,
} from '@tabler/icons-react-native';
import { useEntitlements, useUsageCounters, useContacts } from '@recallr/api';
import { PLANS, PlanType } from '@recallr/core';

export interface SubscriptionScreenProps {
  onBack: () => void;
  onOpenUpgrade: () => void;
  onShowToast: (message: string) => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  onBack,
  onOpenUpgrade,
  onShowToast,
}) => {
  const { data: entitlement, isLoading: isEntitlementLoading } = useEntitlements();
  const { data: usageCounters, isLoading: isUsageLoading } = useUsageCounters();
  const { data: contacts, isLoading: isContactsLoading } = useContacts();

  const plan: PlanType = (entitlement?.plan as PlanType) || 'free';
  const limits = PLANS[plan] || PLANS.free;
  const isPro = plan === 'pro';

  const isLoading = isEntitlementLoading || isUsageLoading || isContactsLoading;

  const currentMonthKey = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const currentDayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const scanCount = useMemo(() => {
    const item = usageCounters?.find(
      (c) => c.kind === 'scan' && c.period_key === currentMonthKey
    );
    return item?.count ?? 0;
  }, [usageCounters, currentMonthKey]);

  const aiCount = useMemo(() => {
    const item = usageCounters?.find(
      (c) => c.kind === 'ai_question' && c.period_key === currentDayKey
    );
    return item?.count ?? 0;
  }, [usageCounters, currentDayKey]);

  const contactCount = contacts?.length ?? 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <PressableScale
            onPress={onBack}
            haptic="light"
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconArrowLeft size={20} color={colors.text} strokeWidth={2} />
          </PressableScale>
          <Text style={styles.headerTitle}>Subscription</Text>
        </View>

        {/* Current Plan Card */}
        {isLoading ? (
          <Card style={styles.planCard}>
            <Skeleton width={80} height={14} style={{ marginBottom: 8 }} />
            <Skeleton width={120} height={26} style={{ marginBottom: 8 }} />
            <Skeleton width={180} height={14} />
          </Card>
        ) : (
          <Card style={styles.planCard}>
            {!isPro && (
              <OrangeCorner
                size="lg"
                onPress={onOpenUpgrade}
                style={styles.upgradeCornerBtn}
              >
                <Text style={styles.upgradeBtnText}>Upgrade</Text>
              </OrangeCorner>
            )}

            <Text style={styles.planLabel}>Current plan</Text>
            <Text style={styles.planName}>{isPro ? 'Pro' : 'Free'}</Text>
            <Text style={styles.planSub}>
              {isPro
                ? 'Unlimited contacts, scans & AI questions'
                : 'Upgrade for unlimited everything'}
            </Text>
          </Card>
        )}

        {/* Your Usage Card */}
        <Text style={styles.sectionHeader}>Your usage</Text>
        {isLoading ? (
          <Card style={styles.usageCard}>
            <View style={styles.usageItem}>
              <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={6} />
            </View>
            <View style={styles.usageItem}>
              <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={6} />
            </View>
            <View style={styles.usageItem}>
              <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={6} />
            </View>
          </Card>
        ) : (
          <Card style={styles.usageCard}>
            {/* Contacts */}
            <View style={styles.usageItem}>
              <View style={styles.usageLabelRow}>
                <Text style={styles.usageName}>Contacts</Text>
                <Text style={styles.usageValue}>
                  {isPro
                    ? `${contactCount} (Unlimited)`
                    : `${contactCount} of ${limits.contacts}`}
                </Text>
              </View>
              <ProgressBar
                progress={
                  isPro
                    ? 0.05
                    : Math.min(contactCount / (limits.contacts || 1), 1)
                }
                color={colors.accent}
                height={6}
              />
            </View>

            {/* Card Scans */}
            <View style={styles.usageItem}>
              <View style={styles.usageLabelRow}>
                <Text style={styles.usageName}>Card scans this month</Text>
                <Text style={styles.usageValue}>
                  {isPro
                    ? `${scanCount} (Unlimited)`
                    : `${scanCount} of ${limits.scansPerMonth}`}
                </Text>
              </View>
              <ProgressBar
                progress={
                  isPro
                    ? 0.05
                    : Math.min(scanCount / (limits.scansPerMonth || 1), 1)
                }
                color={colors.accent}
                height={6}
              />
            </View>

            {/* AI Questions */}
            <View style={styles.usageItem}>
              <View style={styles.usageLabelRow}>
                <Text style={styles.usageName}>AI questions today</Text>
                <Text style={styles.usageValue}>
                  {isPro
                    ? `${aiCount} (Unlimited)`
                    : `${aiCount} of ${limits.aiQuestionsPerDay}`}
                </Text>
              </View>
              <ProgressBar
                progress={
                  isPro
                    ? 0.05
                    : Math.min(aiCount / (limits.aiQuestionsPerDay || 1), 1)
                }
                color={colors.accent}
                height={6}
              />
            </View>
          </Card>
        )}

        {/* Management Links */}
        <Card style={styles.linksCard}>
          <PressableScale
            onPress={() => onShowToast('Restoring previous purchases...')}
            haptic="light"
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>Restore purchases</Text>
            <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale
            onPress={() => onShowToast('Opening App Store account')}
            haptic="light"
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>Manage in store account</Text>
            <IconExternalLink size={16} color={colors.textMuted} strokeWidth={2} />
          </PressableScale>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  planCard: {
    padding: 16,
    marginBottom: 18,
    position: 'relative',
    height: 120,
    justifyContent: 'center',
  },
  planLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  planSub: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginTop: 4,
  },
  upgradeCornerBtn: {
    width: 90,
    height: 48,
    borderTopLeftRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    paddingLeft: 8,
    paddingTop: 4,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  usageCard: {
    padding: 16,
    gap: 16,
    marginBottom: 16,
  },
  usageItem: {
    gap: 8,
  },
  usageLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Inter',
  },
  usageValue: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Inter',
  },
  linksCard: {
    padding: 0,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Inter',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.divider,
    marginHorizontal: 14,
  },
});

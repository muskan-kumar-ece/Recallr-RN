import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { Card, OrangeCorner, Button, PressableScale } from '../components/ui';
import { IconX, IconCrown, IconCheck } from '@tabler/icons-react-native';

export interface UpgradeModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onShowToast: (message: string) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  onClose,
  onSuccess,
  onShowToast,
}) => {
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');

  const features = [
    'Unlimited contacts and card scans',
    'Unlimited AI questions and actions',
    'Multiple digital cards',
    '5 GB for documents',
    'Export and backup',
  ];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <PressableScale
          onPress={onClose}
          haptic="light"
          style={styles.closeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconX size={20} color={colors.text} strokeWidth={2} />
        </PressableScale>
        <PressableScale
          onPress={() => onShowToast('Restoring previous purchases...')}
          haptic="light"
          style={styles.restoreBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.restoreText}>Restore</Text>
        </PressableScale>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Crown Icon */}
        <View style={styles.crownContainer}>
          <View style={styles.crownBox}>
            <IconCrown size={28} color={colors.accent} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Recallr Pro</Text>
          <Text style={styles.subtitle}>Your whole network, no limits.</Text>
        </View>

        {/* Features Checklist Card */}
        <Card style={styles.featuresCard}>
          {features.map((item, idx) => (
            <View key={idx} style={styles.featureRow}>
              <IconCheck size={18} color={colors.accent} strokeWidth={2.5} />
              <Text style={styles.featureText}>{item}</Text>
            </View>
          ))}
        </Card>

        {/* Segmented Toggle: Monthly vs Yearly */}
        <View style={styles.segmentTrack}>
          <PressableScale
            onPress={() => setBillingCycle('monthly')}
            haptic="selection"
            style={[
              styles.segmentBtn,
              billingCycle === 'monthly' && styles.segmentBtnActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                billingCycle === 'monthly' && styles.segmentTextActive,
              ]}
            >
              Monthly
            </Text>
          </PressableScale>

          <PressableScale
            onPress={() => setBillingCycle('yearly')}
            haptic="selection"
            style={[
              styles.segmentBtn,
              billingCycle === 'yearly' && styles.segmentBtnActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                billingCycle === 'yearly' && styles.segmentTextActive,
              ]}
            >
              Yearly · Save 33%
            </Text>
          </PressableScale>
        </View>

        {/* Yearly Option Card */}
        <PressableScale
          onPress={() => setBillingCycle('yearly')}
          haptic="selection"
          style={[
            styles.planCard,
            billingCycle === 'yearly' && styles.planCardActive,
          ]}
        >
          {billingCycle === 'yearly' && (
            <OrangeCorner
              size="sm"
              icon={<IconCheck size={16} color="#FFFFFF" strokeWidth={3} />}
            />
          )}
          <Text style={styles.planTitle}>Yearly</Text>
          <Text style={styles.planPrice}>
            ₹1,199 per year · about ₹100 a month
          </Text>
        </PressableScale>

        {/* Monthly Option Card */}
        <PressableScale
          onPress={() => setBillingCycle('monthly')}
          haptic="selection"
          style={[
            styles.planCard,
            billingCycle === 'monthly' && styles.planCardActive,
          ]}
        >
          {billingCycle === 'monthly' && (
            <OrangeCorner
              size="sm"
              icon={<IconCheck size={16} color="#FFFFFF" strokeWidth={3} />}
            />
          )}
          <Text style={styles.planTitle}>Monthly</Text>
          <Text style={styles.planPrice}>₹149 per month</Text>
        </PressableScale>

        {/* Primary Trial CTA */}
        <Button
          title={`Pay ₹${billingCycle === 'yearly' ? '1,199' : '149'} with Razorpay`}
          variant="primary"
          size="md"
          onPress={() => {
            onShowToast('Recallr Pro activated via Razorpay!');
            onSuccess();
          }}
          style={styles.trialBtn}
        />

        {/* Disclaimer */}
        <Text style={styles.disclaimerText}>
          Secured by Razorpay · UPI (GPay, PhonePe), Cards & NetBanking
        </Text>
        <Text style={styles.linksText}>Terms · Privacy</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    zIndex: 1000,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  restoreText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'center',
  },
  crownContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  crownBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginTop: 4,
  },
  featuresCard: {
    width: '100%',
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Inter',
  },
  segmentTrack: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: colors.fill,
    borderRadius: radius.card,
    padding: 3,
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: radius.input,
  },
  segmentBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  segmentTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  planCard: {
    width: '100%',
    padding: 16,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardActive: {
    borderColor: colors.accent,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  planPrice: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  trialBtn: {
    width: '100%',
    marginTop: 6,
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  linksText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginTop: 4,
  },
});

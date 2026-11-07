import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, radius } from '@recallr/tokens';
import {
  Card,
  OrangeCorner,
  Button,
  Chip,
  Avatar,
  ListRow,
  FieldRow,
  Toggle,
  SegmentedControl,
  ProgressBar,
  Skeleton,
  PressableScale,
} from '../components/ui';
import {
  IconBell,
  IconArrowRight,
} from '@tabler/icons-react-native';

export interface ComponentsGalleryScreenProps {
  onShowToast: (message: string) => void;
}

export const ComponentsGalleryScreen: React.FC<ComponentsGalleryScreenProps> = ({
  onShowToast,
}) => {
  const [toggleVal, setToggleVal] = useState(true);
  const [segmentVal, setSegmentVal] = useState<'day' | 'week' | 'month'>('week');
  const [btnLoading, setBtnLoading] = useState(false);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.galleryTitle}>Component Parity Gallery</Text>
      <Text style={styles.gallerySub}>
        Strict parity with @recallr/tokens design system • Pressed, Loading, Disabled states
      </Text>

      {/* 1. Depth & Contrast (Card on bg vs flat nested card) */}
      <Text style={styles.sectionHeading}>1. Depth & Contrast (New bg #F2F0EB & shadowCard)</Text>
      <Card style={styles.componentCard}>
        <Text style={styles.cardHeader}>Card on #F2F0EB background</Text>
        <Text style={styles.cardDesc}>Uses soft shadowCard and 0.5px border</Text>
        <View style={{ height: 12 }} />
        {/* Nested flat card */}
        <Card flat style={{ padding: 12, backgroundColor: colors.inputCardFill }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
            Nested Card (flat=true)
          </Text>
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
            Inside cards stay flat without extra elevation shadow
          </Text>
        </Card>
      </Card>

      {/* 2. OrangeCorner Variants */}
      <Text style={styles.sectionHeading}>2. Signature OrangeCorner</Text>
      <View style={styles.rowCards}>
        <Card style={styles.sampleCard}>
          <OrangeCorner
            size="sm"
            count={24}
            onPress={() => onShowToast('OrangeCorner sm')}
          />
          <Text style={styles.cardHeader}>Size: sm (48x38)</Text>
          <Text style={styles.cardDesc}>Category badge</Text>
        </Card>

        <Card style={styles.sampleCard}>
          <OrangeCorner
            size="md"
            icon={<IconArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />}
            onPress={() => onShowToast('OrangeCorner md')}
          />
          <Text style={styles.cardHeader}>Size: md (56x44)</Text>
          <Text style={styles.cardDesc}>Section action</Text>
        </Card>
      </View>

      <Card style={[styles.sampleCard, { width: '100%', marginBottom: 16 }]}>
        <OrangeCorner
          size="lg"
          icon={<IconBell size={24} color="#FFFFFF" strokeWidth={2.2} />}
          onPress={() => onShowToast('OrangeCorner lg')}
        />
        <Text style={styles.cardHeader}>Size: lg (78x58)</Text>
        <Text style={styles.cardDesc}>Today hero card corner</Text>
      </Card>

      {/* 3. Buttons (Normal, Loading, Disabled) */}
      <Text style={styles.sectionHeading}>3. Buttons & Interactive States</Text>
      <Card style={styles.componentCard}>
        <Button
          title={btnLoading ? 'Processing...' : 'Tap for Loading State'}
          variant="primary"
          size="md"
          loading={btnLoading}
          onPress={() => {
            setBtnLoading(true);
            setTimeout(() => setBtnLoading(false), 2000);
          }}
          style={styles.btnSpacing}
        />
        <Button
          title="Disabled Button (Zero width jump)"
          variant="primary"
          size="md"
          disabled
          style={styles.btnSpacing}
        />
        <Button
          title="Outline Pill Button"
          variant="outline"
          size="md"
          onPress={() => onShowToast('Outline Button clicked')}
          style={styles.btnSpacing}
        />
        <Button
          title="Secondary Action"
          variant="secondary"
          size="md"
          onPress={() => onShowToast('Secondary Button clicked')}
          style={styles.btnSpacing}
        />
        <View style={styles.rowButtons}>
          <Button
            title="Small Primary"
            variant="primary"
            size="sm"
            onPress={() => onShowToast('Small primary')}
          />
          <Button
            title="Small Outline"
            variant="outline"
            size="sm"
            onPress={() => onShowToast('Small outline')}
          />
        </View>
      </Card>

      {/* 4. PressableScale Primitive */}
      <Text style={styles.sectionHeading}>4. PressableScale UI Thread Spring</Text>
      <Card style={styles.componentCard}>
        <PressableScale
          onPress={() => onShowToast('PressableScale triggered light haptic')}
          haptic="light"
          style={styles.pressableScaleDemo}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.accent }}>
            Press me: scales to 0.97 in 80ms, springs back on release
          </Text>
        </PressableScale>
      </Card>

      {/* 5. Avatars */}
      <Text style={styles.sectionHeading}>5. Avatars</Text>
      <Card style={[styles.componentCard, styles.avatarRow]}>
        <Avatar name="Muskan Kumar" size="xs" />
        <Avatar name="Muskan Kumar" size="sm" />
        <Avatar name="Muskan Kumar" size="md" />
        <Avatar name="Muskan Kumar" size="lg" />
        <Avatar name="Muskan Kumar" size="xl" showBadge />
      </Card>

      {/* 6. Controls: Toggle, Segmented, Progress */}
      <Text style={styles.sectionHeading}>6. Controls & Progress</Text>
      <Card style={styles.componentCard}>
        <View style={styles.toggleRow}>
          <Text style={styles.controlText}>Toggle Switch (Haptic selection)</Text>
          <Toggle value={toggleVal} onValueChange={setToggleVal} />
        </View>

        <SegmentedControl
          segments={[
            { key: 'day', label: 'Day' },
            { key: 'week', label: 'Week' },
            { key: 'month', label: 'Month' },
          ]}
          value={segmentVal}
          onChange={(val) => setSegmentVal(val as 'day' | 'week' | 'month')}
        />

        <Text style={[styles.controlText, { marginTop: 12 }]}>
          Progress Bar (70%)
        </Text>
        <ProgressBar progress={0.7} color={colors.accent} height={6} />
      </Card>

      {/* 7. Chips */}
      <Text style={styles.sectionHeading}>7. Chips</Text>
      <Card style={[styles.componentCard, styles.chipsContainer]}>
        <Chip label="All (Active)" active onPress={() => onShowToast('Chip clicked')} />
        <Chip label="School Friends" onPress={() => onShowToast('School')} />
        <Chip label="App Developers" onPress={() => onShowToast('App Dev')} />
        <Chip label="Plastic" count={9} onPress={() => onShowToast('Plastic')} />
      </Card>

      {/* 8. ListRow & FieldRow */}
      <Text style={styles.sectionHeading}>8. Rows & Fields</Text>
      <Card style={styles.noPadCard}>
        <ListRow
          title="Ramesh Kumar"
          subtitle="Owner, Sri Plastics"
          left={<Avatar name="Ramesh Kumar" size="sm" />}
          right={<Chip label="Plastic" />}
          onPress={() => onShowToast('ListRow tapped')}
        />
        <View style={styles.divider} />
        <FieldRow label="Role" value="Managing Director" />
        <View style={styles.divider} />
        <FieldRow label="Phone" value="+91 98765 43210" />
      </Card>

      {/* 9. Skeletons */}
      <Text style={styles.sectionHeading}>9. Shimmer Skeletons</Text>
      <Card style={styles.componentCard}>
        <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="90%" height={12} style={{ marginBottom: 6 }} />
        <Skeleton width="40%" height={12} />
      </Card>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  galleryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Inter',
  },
  gallerySub: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginBottom: 8,
    marginTop: 12,
  },
  rowCards: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  sampleCard: {
    flex: 1,
    height: 100,
    padding: 14,
    position: 'relative',
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  cardDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  componentCard: {
    padding: 16,
    marginBottom: 14,
  },
  noPadCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 14,
  },
  btnSpacing: {
    marginBottom: 10,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  controlText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Inter',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pressableScaleDemo: {
    padding: 14,
    backgroundColor: colors.accentTint,
    borderRadius: radius.card,
    alignItems: 'center',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.divider,
    marginHorizontal: 14,
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { BottomSheet, Button, PressableScale } from '../components/ui';
import { useRecallrAuth } from '../providers/RecallrProvider';
import { useCompleteOnboarding } from '@recallr/api';
import {
  IconSparkles,
  IconSchool,
  IconBriefcase,
  IconCode,
  IconBuildingStore,
  IconTruck,
  IconPlus,
  IconBrandGoogle,
  IconArrowLeft,
} from '@tabler/icons-react-native';

export interface OnboardingScreenProps {
  onComplete: () => void;
  onShowToast: (message: string) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onShowToast,
}) => {
  const { signInWithPhoneOtp, verifyPhoneOtp, signInWithGoogle, session } = useRecallrAuth();
  const { mutateAsync: saveOnboarding, isPending: isSavingOnboarding } = useCompleteOnboarding();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomCategoryOpen, setIsCustomCategoryOpen] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [selectedCats, setSelectedCats] = useState<Record<string, boolean>>({
    school: true,
    appDev: true,
    suppliers: true,
  });

  useEffect(() => {
    if (session) setStep(4);
  }, [session]);

  const getFormattedPhone = () => {
    const trimmed = phoneNumber.trim();
    if (trimmed.startsWith('+')) return trimmed;
    const cleanDigits = trimmed.replace(/\D/g, '');
    return `+91${cleanDigits}`;
  };

  const handleSendOtp = async () => {
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      onShowToast('Please enter a valid 10-digit phone number');
      return;
    }
    setIsLoading(true);
    try {
      const fullPhone = getFormattedPhone();
      await signInWithPhoneOtp(fullPhone);
      onShowToast(`OTP sent to ${fullPhone}`);
      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP';
      onShowToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.trim().length < 6) {
      onShowToast('Please enter the 6-digit OTP');
      return;
    }
    setIsLoading(true);
    try {
      const fullPhone = getFormattedPhone();
      await verifyPhoneOtp(fullPhone, otpCode.trim());
      onShowToast('Signed in successfully');
      setStep(4);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid verification code';
      onShowToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      setStep(4);
      onShowToast('Signed in successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign in failed';
      onShowToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCat = (key: string) => {
    setSelectedCats((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCount = Object.values(selectedCats).filter(Boolean).length;
  const selectedCategoryNames = [
    selectedCats.school ? 'School Friends' : null,
    selectedCats.colleagues ? 'Colleagues' : null,
    selectedCats.appDev ? 'App Developers' : null,
    selectedCats.clients ? 'Clients' : null,
    selectedCats.suppliers ? 'Suppliers' : null,
    ...customCategories,
  ].filter((name): name is string => Boolean(name));

  const handleComplete = async (skipSelection = false) => {
    try {
      await saveOnboarding((skipSelection ? [] : selectedCategoryNames).map((name) => ({
        name,
        icon: 'folder',
        color: colors.accent,
      })));
      onComplete();
    } catch (error: unknown) {
      onShowToast(error instanceof Error ? error.message : 'Could not save your starter categories');
    }
  };

  const handleAddCustomCategory = () => {
    const name = customCategoryName.trim();
    if (!name) {
      onShowToast('Please enter a category name');
      return;
    }
    if ([...selectedCategoryNames, ...customCategories].some((item) => item.toLowerCase() === name.toLowerCase())) {
      onShowToast('That category is already selected');
      return;
    }
    if (name.length > 30) {
      onShowToast('Category names can be up to 30 characters');
      return;
    }
    setCustomCategories((current) => [...current, name]);
    setCustomCategoryName('');
    setIsCustomCategoryOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Slide indicator dots */}
      <View style={styles.topBar}>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, step === 1 && styles.dotActive]} />
          <View style={[styles.dot, step === 2 && styles.dotActive]} />
          <View style={[styles.dot, step === 3 && styles.dotActive]} />
          <View style={[styles.dot, step === 4 && styles.dotActive]} />
        </View>
        <PressableScale
          onPress={() => {
            if (session) void handleComplete(true);
            else setStep(2);
          }}
          haptic="light"
          style={styles.skipBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.skipText}>Skip</Text>
        </PressableScale>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          /* STEP 1: WELCOME */
          <View style={styles.stepContainer}>
            {/* Visual Business Card Illustration */}
            <View style={styles.cardsVisualBox}>
              <View style={styles.cardBack} />
              <View style={styles.cardFront}>
                <View style={styles.cardBadge} />
                <View style={styles.cardGraphicPatch} />
              </View>
              <View style={styles.sparkleChip}>
                <IconSparkles size={14} color={colors.accent} strokeWidth={2.2} />
                <Text style={styles.sparkleChipText}>Who is Ramesh?</Text>
              </View>
            </View>

            <Text style={styles.headline}>Remember everyone you meet</Text>
            <Text style={styles.bodyDescription}>
              Scan a business card and Recallr saves the person, the place you
              met and what you talked about.
            </Text>

            <Button
              title="Continue"
              variant="primary"
              size="md"
              onPress={() => setStep(2)}
              style={styles.ctaBtn}
            />
          </View>
        )}

        {step === 2 && (
          /* STEP 2: SIGN IN */
          <View style={styles.stepContainer}>
            <View style={styles.brandRow}>
              <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>R</Text>
              </View>
              <Text style={styles.brandText}>Recallr</Text>
            </View>

            <Text style={styles.headline}>Create your account</Text>
            <Text style={styles.bodyDescription}>
              Your network, safe and always with you.
            </Text>

            {/* Phone Number Input */}
            <View style={styles.phoneInputRow}>
              <View style={styles.countryCodeBox}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="Phone number"
                placeholderTextColor={colors.textMuted}
                style={styles.phoneInput}
              />
            </View>

            <Button
              title={isLoading ? 'Sending...' : 'Send OTP'}
              variant="primary"
              size="md"
              disabled={isLoading}
              onPress={handleSendOtp}
              style={styles.ctaBtn}
            />

            {/* Divider with 'or' */}
            <View style={styles.orDividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In */}
            <PressableScale
              disabled={isLoading}
              onPress={handleGoogleSignIn}
              haptic="light"
              style={styles.googleBtn}
            >
              <IconBrandGoogle size={20} color={colors.text} strokeWidth={2} />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </PressableScale>

            <Text style={styles.legalText}>
              By continuing you agree to the Terms and Privacy Policy.
            </Text>
          </View>
        )}

        {step === 3 && (
          /* STEP 3: OTP VERIFY */
          <View style={styles.stepContainer}>
            <PressableScale
              onPress={() => setStep(2)}
              haptic="light"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconArrowLeft size={16} color={colors.textSecondary} />
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Change number</Text>
            </PressableScale>

            <Text style={styles.headline}>Verify your phone</Text>
            <Text style={styles.bodyDescription}>
              Enter the 6-digit code sent to {getFormattedPhone()}
            </Text>

            <View style={[styles.phoneInputRow, { justifyContent: 'center' }]}>
              <TextInput
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="123456"
                placeholderTextColor={colors.textMuted}
                style={[styles.phoneInput, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]}
                autoFocus
              />
            </View>

            <Button
              title={isLoading ? 'Verifying...' : 'Verify & Continue'}
              variant="primary"
              size="md"
              disabled={isLoading}
              onPress={handleVerifyOtp}
              style={styles.ctaBtn}
            />

            <PressableScale
              disabled={isLoading}
              onPress={handleSendOtp}
              haptic="light"
              style={{ alignSelf: 'center', marginTop: 12 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '500' }}>
                Resend OTP
              </Text>
            </PressableScale>
          </View>
        )}

        {step === 4 && (
          /* STEP 4: PICK STARTER CATEGORIES */
          <View style={styles.stepContainer}>
            <Text style={styles.headline}>Who do you want to remember?</Text>
            <Text style={styles.bodyDescription}>
              Pick a few to start. You can change these anytime.
            </Text>

            {/* 2-Column Categories Grid */}
            <View style={styles.catGrid}>
              {/* School Friends */}
              <PressableScale
                onPress={() => toggleCat('school')}
                haptic="selection"
                style={[
                  styles.catBox,
                  selectedCats.school && styles.catBoxSelected,
                ]}
              >
                <View style={styles.catIconSquare}>
                  <IconSchool size={20} color={colors.accent} strokeWidth={2} />
                </View>
                <Text style={styles.catBoxTitle}>School Friends</Text>
              </PressableScale>

              {/* Colleagues */}
              <PressableScale
                onPress={() => toggleCat('colleagues')}
                haptic="selection"
                style={[
                  styles.catBox,
                  selectedCats.colleagues && styles.catBoxSelected,
                ]}
              >
                <View style={styles.catIconSquare}>
                  <IconBriefcase size={20} color={colors.accent} strokeWidth={2} />
                </View>
                <Text style={styles.catBoxTitle}>Colleagues</Text>
              </PressableScale>

              {/* App Developers */}
              <PressableScale
                onPress={() => toggleCat('appDev')}
                haptic="selection"
                style={[
                  styles.catBox,
                  selectedCats.appDev && styles.catBoxSelected,
                ]}
              >
                <View style={styles.catIconSquare}>
                  <IconCode size={20} color={colors.accent} strokeWidth={2} />
                </View>
                <Text style={styles.catBoxTitle}>App Developers</Text>
              </PressableScale>

              {/* Clients */}
              <PressableScale
                onPress={() => toggleCat('clients')}
                haptic="selection"
                style={[
                  styles.catBox,
                  selectedCats.clients && styles.catBoxSelected,
                ]}
              >
                <View style={styles.catIconSquare}>
                  <IconBuildingStore size={20} color={colors.accent} strokeWidth={2} />
                </View>
                <Text style={styles.catBoxTitle}>Clients</Text>
              </PressableScale>

              {/* Suppliers */}
              <PressableScale
                onPress={() => toggleCat('suppliers')}
                haptic="selection"
                style={[
                  styles.catBox,
                  selectedCats.suppliers && styles.catBoxSelected,
                ]}
              >
                <View style={styles.catIconSquare}>
                  <IconTruck size={20} color={colors.accent} strokeWidth={2} />
                </View>
                <Text style={styles.catBoxTitle}>Suppliers</Text>
              </PressableScale>

              {/* Create your own */}
              <PressableScale
                onPress={() => setIsCustomCategoryOpen(true)}
                haptic="light"
                style={styles.catBoxDashed}
              >
                <IconPlus size={20} color={colors.accent} strokeWidth={2.4} />
                <Text style={styles.createOwnText}>Create your own</Text>
              </PressableScale>
            </View>

            {customCategories.map((category) => (
              <PressableScale
                key={category}
                onPress={() => setCustomCategories((current) => current.filter((item) => item !== category))}
                haptic="selection"
                style={[styles.catBox, styles.catBoxSelected]}
              >
                <Text style={styles.catBoxTitle}>{category}</Text>
                <Text style={styles.customCategoryHint}>Tap to remove</Text>
              </PressableScale>
            ))}

            <Button
              title={isSavingOnboarding ? 'Saving...' : `Continue (${selectedCount + customCategories.length} selected)`}
              variant="primary"
              size="md"
              disabled={isSavingOnboarding}
              onPress={() => void handleComplete()}
              style={styles.ctaBtn}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
      <BottomSheet
        isOpen={isCustomCategoryOpen}
        onClose={() => setIsCustomCategoryOpen(false)}
        title="Create your own"
      >
        <TextInput
          value={customCategoryName}
          onChangeText={setCustomCategoryName}
          placeholder="Category name"
          placeholderTextColor={colors.textMuted}
          maxLength={30}
          returnKeyType="done"
          onSubmitEditing={handleAddCustomCategory}
          style={styles.customCategoryInput}
        />
        <Button title="Add category" variant="primary" size="md" onPress={handleAddCustomCategory} />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.accent,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    fontFamily: 'Inter',
  },
  customCategoryInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    color: colors.text,
    fontFamily: 'Inter',
  },
  customCategoryHint: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Inter',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  stepContainer: {
    width: '100%',
  },
  cardsVisualBox: {
    height: 180,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  cardBack: {
    width: 220,
    height: 120,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: colors.border,
    transform: [{ rotate: '-8deg' }],
    position: 'absolute',
    top: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  cardFront: {
    width: 230,
    height: 124,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  cardBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.accent,
    margin: 14,
  },
  cardGraphicPatch: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 100,
    height: 60,
    borderTopLeftRadius: 36,
    backgroundColor: colors.accent,
  },
  sparkleChip: {
    position: 'absolute',
    bottom: -6,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  sparkleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  brandBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Inter',
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  bodyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    lineHeight: 20,
    marginBottom: 24,
  },
  phoneInputRow: {
    flexDirection: 'row',
    height: 50,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 16,
  },
  countryCodeBox: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderRightColor: colors.border,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
    fontFamily: 'Inter',
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: colors.divider,
  },
  orText: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Inter',
  },
  googleBtn: {
    height: 50,
    borderRadius: radius.button,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  legalText: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Inter',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  catBox: {
    width: '48.5%',
    height: 84,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    justifyContent: 'space-between',
  },
  catBoxSelected: {
    borderColor: colors.accent,
  },
  catIconSquare: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catBoxTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  catBoxDashed: {
    width: '48.5%',
    height: 84,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  createOwnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    fontFamily: 'Inter',
  },
  ctaBtn: {
    width: '100%',
  },
});

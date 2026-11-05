import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Typography, Layout } from '../../src/constants/theme';
import { Button, Card, OrangeCorner } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';

interface StarterCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
}

const DEFAULT_CATEGORIES: StarterCategory[] = [
  { id: '1', name: 'School Friends', icon: 'school-outline', selected: true },
  { id: '2', name: 'Colleagues', icon: 'briefcase-outline', selected: false },
  { id: '3', name: 'App Developers', icon: 'code-slash-outline', selected: true },
  { id: '4', name: 'Clients', icon: 'storefront-outline', selected: false },
  { id: '5', name: 'Suppliers', icon: 'cube-outline', selected: true },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { loginWithPhone, verifyPhoneOtp, loginWithGoogle, loginDemoUser, completeOnboarding } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<StarterCategory[]>(DEFAULT_CATEGORIES);
  const [customCatInput, setCustomCatInput] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const selectedCount = categories.filter((c) => c.selected).length;

  // Step 1: Welcome actions
  const handleSkip = async () => {
    await loginDemoUser();
    await completeOnboarding(['School Friends', 'App Developers', 'Suppliers']);
    router.replace('/(tabs)');
  };

  const handleNextFromWelcome = () => {
    setCurrentStep(2);
  };

  // Step 2: Auth actions
  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      showToast('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    const res = await loginWithPhone('+91' + phoneNumber);
    setLoading(false);
    if (res.success) {
      setOtpSent(true);
      showToast(res.message || 'OTP sent! Use 123456 for demo mode');
    } else {
      showToast(res.message || 'Error sending OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) {
      showToast('Please enter the OTP code');
      return;
    }
    setLoading(true);
    const res = await verifyPhoneOtp('+91' + phoneNumber, otpCode);
    setLoading(false);
    if (res.success) {
      setCurrentStep(3);
    } else {
      showToast(res.message || 'Invalid OTP code');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success) {
      setCurrentStep(3);
    } else {
      showToast(res.message || 'Google sign-in failed');
    }
  };

  const handleContinueAsDemo = async () => {
    await loginDemoUser();
    setCurrentStep(3);
  };

  // Step 3: Starter categories actions
  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleAddCustomCategory = () => {
    if (!customCatInput.trim()) return;
    const newCat: StarterCategory = {
      id: String(Date.now()),
      name: customCatInput.trim(),
      icon: 'bookmark-outline',
      selected: true,
    };
    setCategories((prev) => [...prev, newCat]);
    setCustomCatInput('');
    setShowAddCustom(false);
  };

  const handleFinishOnboarding = async () => {
    const selectedNames = categories.filter((c) => c.selected).map((c) => c.name);
    await completeOnboarding(selectedNames);
    showToast('Welcome to Recallr!');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Anchor Header */}
          <View style={styles.anchorNav}>
            <TouchableOpacity
              onPress={() => setCurrentStep(1)}
              style={[styles.anchorPill, currentStep === 1 && styles.anchorPillActive]}
            >
              <Text
                style={[
                  styles.anchorPillText,
                  currentStep === 1 && styles.anchorPillTextActive,
                ]}
              >
                1. Welcome
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentStep(2)}
              style={[styles.anchorPill, currentStep === 2 && styles.anchorPillActive]}
            >
              <Text
                style={[
                  styles.anchorPillText,
                  currentStep === 2 && styles.anchorPillTextActive,
                ]}
              >
                2. Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentStep(3)}
              style={[styles.anchorPill, currentStep === 3 && styles.anchorPillActive]}
            >
              <Text
                style={[
                  styles.anchorPillText,
                  currentStep === 3 && styles.anchorPillTextActive,
                ]}
              >
                3. Categories
              </Text>
            </TouchableOpacity>
          </View>

          {/* MAIN CARD CONTAINER */}
          <View style={styles.phoneContainer}>
            {/* ============================================================== */}
            {/* SLIDE 1: WELCOME */}
            {/* ============================================================== */}
            {currentStep === 1 && (
              <View>
                <View style={styles.topBar}>
                  <Text style={styles.stepBadge}>1. WELCOME</Text>
                  <TouchableOpacity onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                  </TouchableOpacity>
                </View>

                {/* Illustrated Stacked Cards */}
                <View style={styles.stackIllustration}>
                  {/* Background Card Rotated -8 deg */}
                  <View style={[styles.cardBg, { transform: [{ rotate: '-8deg' }] }]}>
                    <View style={styles.cardSquareDot} />
                    <View style={[styles.cardBar, { width: 70, bottom: 14 }]} />
                    <View style={styles.cardOrangeAccentMini} />
                  </View>

                  {/* Foreground Card Rotated +5 deg */}
                  <View style={[styles.cardFg, { transform: [{ rotate: '5deg' }] }]}>
                    <View style={styles.cardSquareDot} />
                    <View style={[styles.cardBar, { width: 80, bottom: 30 }]} />
                    <View style={[styles.cardBar, { width: 56, bottom: 16 }]} />
                    <View style={styles.cardOrangeAccentLarge}>
                      <View style={styles.qrInnerIcon}>
                        <Ionicons name="qr-code-outline" size={20} color={Colors.text} />
                      </View>
                    </View>
                  </View>

                  {/* Ask AI Prompt Floating Pill */}
                  <View style={styles.aiPill}>
                    <Ionicons name="sparkles" size={15} color={Colors.accent} />
                    <Text style={styles.aiPillText}>Who is Ramesh?</Text>
                  </View>
                </View>

                {/* Titles */}
                <Text style={styles.heroTitle}>Remember everyone you meet</Text>
                <Text style={styles.heroSubtitle}>
                  Scan a business card and Recallr saves the person, the place you met and what you talked about.
                </Text>

                {/* 3-Dot Indicator */}
                <View style={styles.dotsRow}>
                  <View style={styles.dotPillActive} />
                  <View style={styles.dotInactive} />
                  <View style={styles.dotInactive} />
                </View>

                <Button
                  title="Continue"
                  variant="primary"
                  onPress={handleNextFromWelcome}
                  style={styles.continueBtn}
                />
              </View>
            )}

            {/* ============================================================== */}
            {/* SLIDE 2: SIGN IN */}
            {/* ============================================================== */}
            {currentStep === 2 && (
              <View>
                <View style={styles.brandRow}>
                  <View style={styles.brandBadge}>
                    <Text style={styles.brandBadgeText}>R</Text>
                  </View>
                  <Text style={styles.brandTitle}>Recallr</Text>
                </View>

                <Text style={styles.heroTitle}>Create your account</Text>
                <Text style={styles.heroSubtitle}>
                  Your network, safe and always with you.
                </Text>

                {!otpSent ? (
                  <View style={styles.inputSection}>
                    <View style={styles.phoneInputCard}>
                      <Text style={styles.countryCode}>+91</Text>
                      <View style={styles.verticalDivider} />
                      <TextInput
                        placeholder="Phone number"
                        placeholderTextColor={Colors.muted}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        style={styles.textInput}
                        maxLength={10}
                      />
                    </View>

                    <Button
                      title="Send OTP"
                      variant="primary"
                      loading={loading}
                      onPress={handleSendOtp}
                      style={{ marginTop: 14 }}
                    />
                  </View>
                ) : (
                  <View style={styles.inputSection}>
                    <View style={styles.phoneInputCard}>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={18}
                        color={Colors.accent}
                        style={{ marginRight: 8 }}
                      />
                      <TextInput
                        placeholder="Enter 6-digit OTP (e.g. 123456)"
                        placeholderTextColor={Colors.muted}
                        value={otpCode}
                        onChangeText={setOtpCode}
                        keyboardType="number-pad"
                        style={styles.textInput}
                        maxLength={6}
                      />
                    </View>

                    <Button
                      title="Verify & Continue"
                      variant="primary"
                      loading={loading}
                      onPress={handleVerifyOtp}
                      style={{ marginTop: 14 }}
                    />

                    <TouchableOpacity
                      onPress={() => setOtpSent(false)}
                      style={{ marginTop: 12, alignItems: 'center' }}
                    >
                      <Text style={{ color: Colors.secondary, fontSize: 13 }}>
                        Edit phone number
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.orDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.orText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  title="Continue with Google"
                  variant="secondary"
                  leftIcon="logo-google"
                  onPress={handleGoogleSignIn}
                />

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleContinueAsDemo}
                  style={styles.demoLink}
                >
                  <Text style={styles.demoLinkText}>
                    Continue as Demo Guest (Instant)
                  </Text>
                </TouchableOpacity>

                <Text style={styles.termsText}>
                  By continuing you agree to the Terms and Privacy Policy.
                </Text>
              </View>
            )}

            {/* ============================================================== */}
            {/* SLIDE 3: PICK STARTER CATEGORIES */}
            {/* ============================================================== */}
            {currentStep === 3 && (
              <View>
                <Text style={styles.heroTitle}>Who do you want to remember?</Text>
                <Text style={styles.heroSubtitle}>
                  Pick a few to start. You can change these anytime.
                </Text>

                {/* 2-Column Categories Grid */}
                <View style={styles.categoriesGrid}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.8}
                      onPress={() => toggleCategory(cat.id)}
                      style={[
                        styles.catCard,
                        cat.selected && styles.catCardSelected,
                      ]}
                    >
                      <View style={styles.catCardHeader}>
                        <View
                          style={[
                            styles.catIconWrap,
                            cat.selected && styles.catIconWrapSelected,
                          ]}
                        >
                          <Ionicons
                            name={cat.icon}
                            size={18}
                            color={cat.selected ? Colors.accent : Colors.text}
                          />
                        </View>
                        {cat.selected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color={Colors.accent}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.catName,
                          cat.selected && styles.catNameSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  {/* Create Custom Category Card */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowAddCustom(true)}
                    style={styles.catCardDashed}
                  >
                    <Ionicons name="add" size={24} color={Colors.accent} />
                    <Text style={styles.catDashedText}>Create your own</Text>
                  </TouchableOpacity>
                </View>

                {/* Inline custom category creator */}
                {showAddCustom && (
                  <View style={styles.customCatBox}>
                    <TextInput
                      placeholder="Category name (e.g. Investors, Mentors)"
                      placeholderTextColor={Colors.muted}
                      value={customCatInput}
                      onChangeText={setCustomCatInput}
                      style={styles.customCatInput}
                    />
                    <View style={styles.customCatActions}>
                      <TouchableOpacity
                        onPress={() => setShowAddCustom(false)}
                        style={styles.customCatCancel}
                      >
                        <Text style={{ color: Colors.secondary, fontSize: 13 }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleAddCustomCategory}
                        style={styles.customCatAdd}
                      >
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                          Add
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <Button
                  title={`Continue (${selectedCount} selected)`}
                  variant="primary"
                  onPress={handleFinishOnboarding}
                  style={styles.continueBtn}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  anchorNav: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  anchorPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  anchorPillActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  anchorPillText: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
    fontWeight: Typography.weights.medium,
  },
  anchorPillTextActive: {
    color: Colors.accent,
    fontWeight: Typography.weights.bold,
  },
  phoneContainer: {
    width: '100%',
    maxWidth: 412,
    backgroundColor: Colors.background,
    borderRadius: Radius.xxl,
    padding: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBadge: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
  },
  skipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.secondary,
  },
  stackIllustration: {
    position: 'relative',
    height: 200,
    marginTop: 8,
    marginBottom: 12,
  },
  cardBg: {
    position: 'absolute',
    left: 18,
    top: 14,
    width: 200,
    height: 118,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.card,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardFg: {
    position: 'absolute',
    left: 90,
    top: 48,
    width: 210,
    height: 124,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.card,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardSquareDot: {
    position: 'absolute',
    left: 14,
    top: 14,
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: Colors.accent,
  },
  cardBar: {
    position: 'absolute',
    left: 14,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EBE9E4',
  },
  cardOrangeAccentMini: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 90,
    height: 60,
    backgroundColor: Colors.accent,
    borderTopLeftRadius: 36,
  },
  cardOrangeAccentLarge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 104,
    height: 72,
    backgroundColor: Colors.accent,
    borderTopLeftRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  qrInnerIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiPill: {
    position: 'absolute',
    left: 10,
    bottom: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  aiPillText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
  },
  heroTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    lineHeight: 30,
    marginTop: 10,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.secondary,
    lineHeight: 20,
    marginTop: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 20,
    justifyContent: 'center',
  },
  dotPillActive: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  dotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D6D3CC',
  },
  continueBtn: {
    marginTop: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    marginBottom: 16,
  },
  brandBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  inputSection: {
    marginTop: 16,
  },
  phoneInputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.card,
    borderWidth: 0.5,
    borderColor: Colors.border,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  countryCode: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.divider,
    marginHorizontal: 12,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: Colors.divider,
  },
  orText: {
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
  demoLink: {
    marginTop: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  demoLinkText: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    fontWeight: Typography.weights.medium,
    textDecorationLine: 'underline',
  },
  termsText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    lineHeight: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  catCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.card,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 14,
  },
  catCardSelected: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
  catCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 28,
  },
  catIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catIconWrapSelected: {
    backgroundColor: Colors.accentLight,
  },
  catName: {
    fontWeight: Typography.weights.medium,
    fontSize: Typography.sizes.sm,
    marginTop: 10,
    color: Colors.text,
  },
  catNameSelected: {
    color: Colors.accent,
  },
  catCardDashed: {
    width: '48%',
    backgroundColor: 'transparent',
    borderRadius: Radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.accent,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
  },
  catDashedText: {
    color: Colors.accent,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginTop: 4,
  },
  customCatBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.card,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 12,
    marginTop: 12,
  },
  customCatInput: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
    paddingBottom: 8,
    marginBottom: 10,
  },
  customCatActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    alignItems: 'center',
  },
  customCatCancel: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  customCatAdd: {
    backgroundColor: Colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
  },
});

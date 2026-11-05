import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Typography } from '../../src/constants/theme';
import { Button } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithPhone, verifyPhoneOtp, loginWithGoogle, loginDemoUser } = useAuth();
  const { showToast } = useToast();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 8) {
      showToast('Enter a valid phone number');
      return;
    }
    setLoading(true);
    const res = await loginWithPhone('+91' + phone);
    setLoading(false);
    if (res.success) {
      setOtpSent(true);
      showToast(res.message || 'OTP sent');
    } else {
      showToast(res.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      showToast('Enter the OTP code');
      return;
    }
    setLoading(true);
    const res = await verifyPhoneOtp('+91' + phone, otp);
    setLoading(false);
    if (res.success) {
      showToast('Signed in successfully');
      router.replace('/(tabs)');
    } else {
      showToast(res.message || 'Invalid OTP');
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success) {
      router.replace('/(tabs)');
    } else {
      showToast(res.message || 'Google sign-in failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>R</Text>
          </View>
          <Text style={styles.brandTitle}>Recallr</Text>
        </View>

        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subheading}>Sign in to access your contacts and notes.</Text>

        {!otpSent ? (
          <View style={{ marginTop: 24 }}>
            <View style={styles.phoneInput}>
              <Text style={styles.codeText}>+91</Text>
              <View style={styles.divider} />
              <TextInput
                placeholder="Phone number"
                placeholderTextColor={Colors.muted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
            <Button
              title="Send OTP"
              onPress={handleSendOtp}
              loading={loading}
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          <View style={{ marginTop: 24 }}>
            <View style={styles.phoneInput}>
              <TextInput
                placeholder="Enter 6-digit OTP"
                placeholderTextColor={Colors.muted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
            <Button
              title="Verify & Enter"
              onPress={handleVerifyOtp}
              loading={loading}
              style={{ marginTop: 16 }}
            />
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
          onPress={handleGoogle}
        />

        <TouchableOpacity
          onPress={async () => {
            await loginDemoUser();
            router.replace('/(tabs)');
          }}
          style={styles.demoBtn}
        >
          <Text style={styles.demoText}>Quick Demo Access</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backBtn: {
    marginBottom: 20,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
  },
  subheading: {
    fontSize: 14,
    color: Colors.secondary,
    marginTop: 6,
  },
  phoneInput: {
    backgroundColor: '#fff',
    borderRadius: Radius.card,
    borderWidth: 0.5,
    borderColor: Colors.border,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.divider,
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: Colors.divider,
  },
  orText: {
    fontSize: 12,
    color: Colors.muted,
  },
  demoBtn: {
    marginTop: 16,
    alignItems: 'center',
    padding: 10,
  },
  demoText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '500',
  },
});

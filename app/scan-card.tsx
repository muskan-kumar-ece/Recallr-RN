import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Typography } from '../src/constants/theme';
import { Card, Button } from '../src/components/ui';
import { useToast } from '../src/context/ToastContext';

export default function ScanCardScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [scanning, setScanning] = useState(false);

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      showToast('Card scanned! Reviewing contact info...');
      router.push('/contact/new');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.phoneFrame}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Scan Business Card</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Viewfinder Target */}
        <View style={styles.viewfinderContainer}>
          <View style={styles.cardFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <Ionicons
              name="scan"
              size={48}
              color={Colors.accent}
              style={{ opacity: 0.6 }}
            />
            <Text style={styles.hintText}>
              Align business card inside frame
            </Text>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.controls}>
          <Button
            title={scanning ? 'AI Processing...' : 'Capture & Extract'}
            variant="primary"
            loading={scanning}
            leftIcon="camera-outline"
            onPress={simulateScan}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  phoneFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 412,
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: '#FFFFFF',
  },
  viewfinderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cardFrame: {
    width: '100%',
    height: 220,
    borderRadius: Radius.card,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.accent,
  },
  cornerTL: {
    top: 10,
    left: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 10,
    right: 10,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  hintText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: Typography.sizes.sm,
    marginTop: 14,
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
});

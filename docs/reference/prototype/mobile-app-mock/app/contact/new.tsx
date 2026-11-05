import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Radius, Typography } from '../../src/constants/theme';
import { Card, Button } from '../../src/components/ui';
import { useToast } from '../../src/context/ToastContext';

export default function NewContactScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [metAt, setMetAt] = useState('');
  const [bio, setBio] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Please enter contact name');
      return;
    }
    showToast(`Added ${name} to Recallr!`);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.phoneFrame}>
          <Card style={styles.formCard}>
            <Text style={styles.label}>FULL NAME *</Text>
            <TextInput
              placeholder="e.g. Aarav Sharma"
              placeholderTextColor={Colors.muted}
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <Text style={styles.label}>TITLE / ROLE</Text>
            <TextInput
              placeholder="e.g. Lead Mobile Architect"
              placeholderTextColor={Colors.muted}
              value={headline}
              onChangeText={setHeadline}
              style={styles.input}
            />

            <Text style={styles.label}>COMPANY / ORGANIZATION</Text>
            <TextInput
              placeholder="e.g. Pixel Labs"
              placeholderTextColor={Colors.muted}
              value={company}
              onChangeText={setCompany}
              style={styles.input}
            />

            <Text style={styles.label}>PHONE NUMBER</Text>
            <TextInput
              placeholder="e.g. +91 98765 11122"
              placeholderTextColor={Colors.muted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
            />

            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              placeholder="e.g. aarav@example.com"
              placeholderTextColor={Colors.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.label}>WHERE DID YOU MEET?</Text>
            <TextInput
              placeholder="e.g. Bangalore Tech Summit 2024"
              placeholderTextColor={Colors.muted}
              value={metAt}
              onChangeText={setMetAt}
              style={styles.input}
            />

            <Text style={styles.label}>NOTES & CONTEXT</Text>
            <TextInput
              placeholder="What did you talk about? Key takeaways..."
              placeholderTextColor={Colors.muted}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              style={[styles.input, styles.textArea]}
            />
          </Card>

          <Button
            title="Save Contact"
            variant="primary"
            onPress={handleSave}
            style={{ marginTop: 18 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 412,
  },
  formCard: {
    padding: 16,
    marginTop: 12,
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.muted,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
});

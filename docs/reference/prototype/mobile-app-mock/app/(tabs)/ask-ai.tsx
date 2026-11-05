import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography } from '../../src/constants/theme';
import { Card, OrangeCorner, ListRow } from '../../src/components/ui';
import { INITIAL_CONTACTS } from '../../src/data/mockData';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sourceLine?: string;
  contact?: typeof INITIAL_CONTACTS[0];
  actionCard?: {
    type: 'add_contact' | 'set_reminder' | 'create_category';
    label: string;
    description: string;
    confirmed?: boolean;
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm-1',
    sender: 'user',
    text: 'Who is Ramesh?',
  },
  {
    id: 'm-2',
    sender: 'ai',
    text: 'Ramesh Gupta is the Managing Director at Apex Packaging Industries. You met him at the FICCI Manufacturing Conclave in New Delhi on July 4, 2024. He was looking to upgrade his ERP software and requested a supplier quota for polymers.',
    sourceLine: 'Source: 2 notes, 1 card scan from FICCI Conclave 2024',
    contact: INITIAL_CONTACTS[3], // Ramesh Gupta
  },
];

export default function AskAiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputText;
    if (!q.trim()) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: q.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse: Message;

      const lower = q.toLowerCase();
      if (lower.includes('plastic') || lower.includes('plastics')) {
        aiResponse = {
          id: String(Date.now() + 1),
          sender: 'ai',
          text: 'You have 2 contacts in the Plastic Business category: Mukesh Patel (Alpha Polymers) and Ramesh Gupta (Apex Packaging). Both were met at industrial expos in mid-2024.',
          sourceLine: 'Source: Plastic Business category (9 contacts total)',
          contact: INITIAL_CONTACTS[2], // Mukesh
        };
      } else if (lower.includes('aarav') || lower.includes('flutter') || lower.includes('developer')) {
        aiResponse = {
          id: String(Date.now() + 1),
          sender: 'ai',
          text: 'Aarav Sharma is a Flutter & React Native developer at Pixel Labs. You met at Bangalore Tech Summit 2024.',
          sourceLine: 'Source: App Developers category · Last contacted 2 days ago',
          contact: INITIAL_CONTACTS[0],
        };
      } else {
        aiResponse = {
          id: String(Date.now() + 1),
          sender: 'ai',
          text: `Found information regarding "${q}". Would you like me to create a follow-up reminder or add a quick note to their profile?`,
          actionCard: {
            type: 'set_reminder',
            label: 'Set Reminder',
            description: `Follow up regarding: "${q}"`,
            confirmed: false,
          },
        };
      }

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.phoneFrame}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.sparkleWrap}>
                <Ionicons name="sparkles" size={18} color={Colors.accent} />
              </View>
              <View>
                <Text style={styles.title}>Ask Recallr</Text>
                <Text style={styles.subtitle}>AI Professional Memory</Text>
              </View>
            </View>
          </View>

          {/* Quick Prompts Row */}
          <View style={styles.suggestionsRow}>
            <TouchableOpacity
              onPress={() => handleSend('Who is Ramesh?')}
              style={styles.suggestionChip}
            >
              <Text style={styles.suggestionText}>Who is Ramesh?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSend('Who do I know in plastics?')}
              style={styles.suggestionChip}
            >
              <Text style={styles.suggestionText}>Who is in plastics?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSend('Show developers I met')}
              style={styles.suggestionChip}
            >
              <Text style={styles.suggestionText}>Developers</Text>
            </TouchableOpacity>
          </View>

          {/* Chat Messages */}
          <ScrollView
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.msgContainer,
                  m.sender === 'user' ? styles.userContainer : styles.aiContainer,
                ]}
              >
                {m.sender === 'ai' ? (
                  <Card style={styles.aiMessageCard}>
                    <Text style={styles.aiMessageText}>{m.text}</Text>

                    {/* Person Card Preview */}
                    {m.contact && (
                      <View style={styles.contactCardPreview}>
                        <ListRow
                          title={m.contact.name}
                          subtitle={`${m.contact.headline} · ${m.contact.company}`}
                          tag={m.contact.category_names?.[0]}
                          showDivider={false}
                          onPress={() =>
                            router.push({
                              pathname: '/contact/[id]',
                              params: { id: m.contact!.id },
                            })
                          }
                        />
                      </View>
                    )}

                    {/* Action Confirmation Card (AI Tool Calling Preview) */}
                    {m.actionCard && (
                      <View style={styles.confirmActionCard}>
                        <View style={styles.confirmHeader}>
                          <Ionicons
                            name="flash-outline"
                            size={16}
                            color={Colors.accent}
                          />
                          <Text style={styles.confirmTitle}>
                            Confirm AI Action
                          </Text>
                        </View>
                        <Text style={styles.confirmDesc}>
                          {m.actionCard.description}
                        </Text>
                        <TouchableOpacity
                          style={styles.confirmBtn}
                          onPress={() => {
                            setMessages((prev) =>
                              prev.map((msg) =>
                                msg.id === m.id
                                  ? {
                                      ...msg,
                                      actionCard: {
                                        ...msg.actionCard!,
                                        confirmed: true,
                                      },
                                    }
                                  : msg
                              )
                            );
                          }}
                        >
                          <Text style={styles.confirmBtnText}>
                            {m.actionCard.confirmed ? 'Confirmed ✓' : 'Confirm'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Source Line */}
                    {m.sourceLine && (
                      <View style={styles.sourceLineBox}>
                        <Ionicons
                          name="document-text-outline"
                          size={12}
                          color={Colors.muted}
                        />
                        <Text style={styles.sourceLineText}>{m.sourceLine}</Text>
                      </View>
                    )}
                  </Card>
                ) : (
                  <View style={styles.userBubble}>
                    <Text style={styles.userBubbleText}>{m.text}</Text>
                  </View>
                )}
              </View>
            ))}

            {isTyping && (
              <View style={styles.aiContainer}>
                <Card style={[styles.aiMessageCard, { paddingVertical: 12 }]}>
                  <Text style={{ color: Colors.muted, fontSize: 13 }}>
                    Recallr AI is thinking...
                  </Text>
                </Card>
              </View>
            )}
          </ScrollView>

          {/* Chat Input Bar */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Ask anything about your network..."
              placeholderTextColor={Colors.muted}
              value={inputText}
              onChangeText={setInputText}
              style={styles.chatInput}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              onPress={() => handleSend()}
              style={[
                styles.sendBtn,
                Boolean(inputText.trim()) && styles.sendBtnActive,
              ]}
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color={inputText.trim() ? '#FFFFFF' : Colors.muted}
              />
            </TouchableOpacity>
          </View>
        </View>
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
    alignItems: 'center',
  },
  phoneFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 412,
    paddingHorizontal: 14,
  },
  header: {
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sparkleWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 10,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.pill,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  suggestionText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 10,
    gap: 12,
  },
  msgContainer: {
    width: '100%',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  userBubble: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    maxWidth: '82%',
  },
  userBubbleText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.base,
    lineHeight: 20,
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  aiMessageCard: {
    width: '100%',
    padding: 14,
  },
  aiMessageText: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
    lineHeight: 21,
  },
  contactCardPreview: {
    marginTop: 12,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  confirmActionCard: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  confirmTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
  },
  confirmDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    marginBottom: 8,
  },
  confirmBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  sourceLineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  sourceLineText: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.pill,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 50,
    marginVertical: 10,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: Colors.accent,
  },
});

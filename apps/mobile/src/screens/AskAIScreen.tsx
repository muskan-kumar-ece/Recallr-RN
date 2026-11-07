import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { Card, OrangeCorner, Avatar, PressableScale, Button } from '../components/ui';
import {
  IconSparkles,
  IconArrowRight,
  IconFileText,
  IconArrowUp,
  IconHelpCircle,
} from '@tabler/icons-react-native';
import { useAIChat, useConfirmAIAction, useContacts } from '@recallr/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  contactId?: string | null;
  actions?: { label: string; action: string }[];
  citations?: string[];
  confirm?: {
    id: string;
    title: string;
    rows: Array<{ label: string; value: string; new?: boolean }>;
    destructive: boolean;
    status?: string;
    undoable?: boolean;
  };
}

export interface AskAIScreenProps {
  initialQuery?: string;
  onNavigateContact: (id: string) => void;
  onShowToast: (message: string) => void;
}

export const AskAIScreen: React.FC<AskAIScreenProps> = ({
  initialQuery,
  onNavigateContact,
  onShowToast,
}) => {
  const { data: contacts } = useContacts();
  const { mutateAsync: askAI, isPending: isThinking } = useAIChat();
  const { mutateAsync: confirmAI, isPending: isConfirming } = useConfirmAIAction();

  const [inputText, setInputText] = useState(initialQuery || '');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollRef = useRef<React.ElementRef<typeof ScrollView> | null>(null);

  const contactMap = React.useMemo(() => {
    const map = new Map<string, NonNullable<typeof contacts>[number]>();
    (contacts || []).forEach((c) => map.set(c.id, c));
    return map;
  }, [contacts]);

  const defaultSuggestions = [
    'Who do I need to follow up with?',
    'Summarize my recent conversations',
    'Who are my contacts in engineering or design?',
  ];

  const decideAIAction = async (messageId: string, pendingActionId: string, decision: 'confirm' | 'cancel' | 'undo') => {
    try {
      await confirmAI({ pendingActionId, decision });
      const status = decision === 'confirm' ? 'Saved' : decision === 'undo' ? 'Undone' : 'Cancelled';
      setMessages((previous) => previous.map((message) =>
        message.id === messageId && message.confirm
          ? { ...message, confirm: { ...message.confirm, status, undoable: decision === 'confirm' } }
          : message
      ));
    } catch (error: unknown) {
      onShowToast(error instanceof Error ? error.message : 'Could not update the proposed action');
    }
  };

  const handleSend = async (queryText?: string) => {
    const prompt = (queryText || inputText).trim();
    if (!prompt || isThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true });
    }, 100);

    try {
      const response = await askAI({ message: prompt, conversationId });
      setConversationId(response.conversationId);
      const blocks = response.response?.blocks || [];
      let replyText = '';
      const replyContactIds: string[] = [];
      const replyChips: string[] = [];
      const citations: string[] = [];
      let confirmation: ChatMessage['confirm'];

      for (const block of blocks) {
        if (block.type === 'text') {
          replyText += (replyText ? '\n\n' : '') + block.text;
        } else if (block.type === 'person_cards' && Array.isArray(block.contact_ids)) {
          replyContactIds.push(...block.contact_ids);
        } else if (block.type === 'chips' && Array.isArray(block.items)) {
          replyChips.push(...block.items);
        } else if (block.type === 'sources') {
          citations.push(block.text);
        } else if (block.type === 'question') {
          replyText += (replyText ? '\n\n' : '') + block.text;
          replyChips.push(...(block.quick_replies || []));
        } else if (block.type === 'confirm') {
          confirmation = {
            id: block.pending_action_id,
            title: block.title,
            rows: block.rows,
            destructive: block.destructive === true,
          };
        }
      }

      // Check if response references any of the user's contacts
      let matchedContactId: string | null = replyContactIds[0] || null;
      if (!matchedContactId && contacts && contacts.length > 0) {
        const found = contacts.find((c) =>
          c.name && prompt.toLowerCase().includes(c.name.toLowerCase())
        );
        if (found) matchedContactId = found.id;
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyText || 'Here is the relevant information from your network.',
        contactId: matchedContactId,
        citations,
        actions: replyChips.map((c) => ({ label: c, action: c })),
        confirm: confirmation,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      setTimeout(() => {
        scrollRef.current?.scrollToEnd?.({ animated: true });
      }, 100);
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: err instanceof Error ? err.message : 'Sorry, I encountered an issue connecting to your AI assistant.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconBox}>
              <IconSparkles size={18} color={colors.accent} strokeWidth={2.2} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Ask Recallr</Text>
              <Text style={styles.headerSubtitle}>Grounded in your real network & notes</Text>
            </View>
          </View>
        </View>

        {/* Empty State / Suggestions */}
        {messages.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <IconHelpCircle size={32} color={colors.accent} strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>What would you like to know?</Text>
            <Text style={styles.emptyDescription}>
              Ask about past meetings, upcoming follow-ups, or search for anyone by role, company, or note.
            </Text>

            <View style={styles.suggestionsList}>
              {defaultSuggestions.map((s) => (
                <PressableScale
                  key={s}
                  onPress={() => handleSend(s)}
                  haptic="selection"
                  style={styles.suggestionTile}
                >
                  <Text style={styles.suggestionTileText}>{s}</Text>
                  <IconArrowRight size={14} color={colors.accent} strokeWidth={2} />
                </PressableScale>
              ))}
            </View>
          </View>
        )}

        {/* Messages Stream */}
        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <View key={msg.id} style={styles.userBubbleContainer}>
                <View style={styles.userBubble}>
                  <Text style={styles.userBubbleText}>{msg.content}</Text>
                </View>
              </View>
            );
          }

          const linkedContact = msg.contactId ? contactMap.get(msg.contactId) : null;

          return (
            <View key={msg.id} style={styles.assistantMsgContainer}>
              <Card style={styles.assistantCard}>
                <Text style={styles.assistantText}>{msg.content}</Text>

                {/* Grounded Contact Card */}
                {linkedContact && (
                  <Card
                    style={styles.embeddedContactCard}
                    onPress={() => onNavigateContact(linkedContact.id)}
                  >
                    <OrangeCorner
                      size="sm"
                      icon={<IconArrowRight size={16} color="#FFFFFF" strokeWidth={2.4} />}
                    />
                    <View style={styles.embeddedRow}>
                      <Avatar
                        name={linkedContact.name}
                        src={linkedContact.photo_path || undefined}
                        size="sm"
                      />
                      <View style={styles.embeddedInfo}>
                        <Text style={styles.embeddedName}>{linkedContact.name}</Text>
                        <Text style={styles.embeddedRole}>
                          {[linkedContact.role, linkedContact.company].filter(Boolean).join(' • ')}
                        </Text>
                      </View>
                    </View>
                  </Card>
                )}

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <View style={styles.citationRow}>
                    <IconFileText size={14} color={colors.textMuted} strokeWidth={1.8} />
                    <Text style={styles.citationText}>
                      Grounded in: {msg.citations.join(', ')}
                    </Text>
                  </View>
                )}

                {msg.confirm && (
                  <View style={[styles.confirmCard, msg.confirm.destructive && styles.confirmCardDanger]}>
                    <Text style={styles.confirmTitle}>{msg.confirm.title}</Text>
                    {msg.confirm.rows.map((row, index) => (
                      <View key={`${row.label}-${index}`} style={styles.confirmRow}>
                        <Text style={styles.confirmLabel}>{row.label}</Text>
                        <Text style={styles.confirmValue}>{row.value}{row.new ? ' · New' : ''}</Text>
                      </View>
                    ))}
                    {msg.confirm.status ? (
                      <View style={styles.confirmStatusRow}>
                        <Text style={styles.confirmStatus}>{msg.confirm.status}</Text>
                        {msg.confirm.status === 'Saved' && msg.confirm.undoable && <PressableScale disabled={isConfirming} onPress={() => void decideAIAction(msg.id, msg.confirm!.id, 'undo')}><Text style={styles.undoAction}>Undo</Text></PressableScale>}
                      </View>
                    ) : (
                      <View style={styles.confirmButtons}>
                        <Button
                          title="Cancel"
                          variant="outline"
                          size="sm"
                          disabled={isConfirming}
                          onPress={() => void decideAIAction(msg.id, msg.confirm!.id, 'cancel')}
                          style={styles.confirmButton}
                        />
                        <Button
                          title={msg.confirm.destructive ? 'Delete' : 'Confirm'}
                          variant={msg.confirm.destructive ? 'danger' : 'primary'}
                          size="sm"
                          loading={isConfirming}
                          disabled={isConfirming}
                          onPress={() => void decideAIAction(msg.id, msg.confirm!.id, 'confirm')}
                          style={styles.confirmButton}
                        />
                      </View>
                    )}
                  </View>
                )}
              </Card>

              {/* Action Chips */}
              {msg.actions && msg.actions.length > 0 && (
                <View style={styles.suggestionChipsRow}>
                  {msg.actions.map((act, i) => (
                    <PressableScale
                      key={i}
                      onPress={() => void handleSend(act.action)}
                      haptic="selection"
                      style={styles.actionChip}
                    >
                      <Text style={styles.actionChipText}>{act.label}</Text>
                    </PressableScale>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {isThinking && (
          <View style={styles.thinkingContainer}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.thinkingText}>Consulting your network memory...</Text>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating Bottom Input Bar */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask or tell Recallr..."
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />

          <PressableScale
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isThinking}
            haptic="selection"
            style={[
              styles.sendBtn,
              !inputText.trim() && styles.sendBtnDisabled,
            ]}
          >
            <IconArrowUp
              size={18}
              color={inputText.trim() ? '#FFFFFF' : colors.textMuted}
              strokeWidth={2.4}
            />
          </PressableScale>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.accentTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.accentTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 24,
  },
  suggestionsList: {
    width: '100%',
    gap: 8,
  },
  suggestionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionTileText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  userBubbleContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.card,
    borderBottomRightRadius: 4,
    maxWidth: '80%',
  },
  userBubbleText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  assistantMsgContainer: {
    marginBottom: 16,
  },
  assistantCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  assistantText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  embeddedContactCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 10,
    marginTop: 8,
    marginBottom: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  embeddedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 24,
  },
  embeddedInfo: {
    flex: 1,
  },
  embeddedName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  embeddedRole: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  citationText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  confirmCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.accentTintSoft,
    borderWidth: 1,
    borderColor: colors.accentTint,
    gap: 7,
  },
  confirmCardDanger: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerTint,
  },
  confirmTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  confirmLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  confirmValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  confirmButton: {
    flex: 1,
  },
  confirmStatus: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  confirmStatusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  undoAction: { color: colors.accent, fontSize: 12, fontWeight: '600', padding: 8 },
  suggestionChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  actionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.full,
  },
  actionChipText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  thinkingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: colors.fill,
  },
});

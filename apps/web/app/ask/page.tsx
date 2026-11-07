'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  IconSparkles,
  IconArrowUp,
  IconArrowUpRight,
  IconFileText,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { OrangeCorner } from '@/components/ui/OrangeCorner';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { LimitReachedSheet } from '@/components/ui/LimitReachedSheet';
import { useAIChat, useConfirmAIAction, useContacts, useEntitlements } from '@recallr/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  contactIds?: string[];
  chips?: string[];
  sources?: string[];
  confirm?: {
    id: string;
    title: string;
    rows: Array<{ label: string; value: string; new?: boolean }>;
    destructive: boolean;
    status?: string;
    undoable?: boolean;
  };
  timestamp: string;
}

function AskRecallrContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { data: contacts } = useContacts();
  const { data: entitlements } = useEntitlements();
  const { mutateAsync: askAIAsync, isPending: isThinking } = useAIChat();
  const { mutateAsync: confirmAIAsync, isPending: isConfirming } = useConfirmAIAction();

  const [input, setInput] = useState(initialQuery);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [limitOpen, setLimitOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPro = entitlements?.plan === 'pro';

  // Contact map for fast lookup of contact cards
  const contactMap = React.useMemo(() => {
    const map = new Map<string, NonNullable<typeof contacts>[number]>();
    (contacts || []).forEach((c) => map.set(c.id, c));
    return map;
  }, [contacts]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // If initial query provided via URL, auto-send
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      sendMessage(initialQuery);
    }
  }, [initialQuery]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isThinking) return;

    const userText = textToSend.trim();
    setInput('');

    const userMessage: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await askAIAsync({ message: userText, conversationId });
      setConversationId(res.conversationId);
      const blocks = res.response?.blocks || [];

      let replyText = '';
      const replyContactIds: string[] = [];
      const replyChips: string[] = [];
      const sources: string[] = [];
      let confirmation: ChatMessage['confirm'];

      for (const block of blocks) {
        if (block.type === 'text') {
          replyText += (replyText ? '\n\n' : '') + block.text;
        } else if (block.type === 'person_cards' && Array.isArray(block.contact_ids)) {
          replyContactIds.push(...block.contact_ids);
        } else if (block.type === 'chips' && Array.isArray(block.items)) {
          replyChips.push(...block.items);
        } else if (block.type === 'sources') {
          sources.push(block.text);
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

      const assistantMessage: ChatMessage = {
        id: res.messageId || `a_${Date.now()}`,
        role: 'assistant',
        text: replyText || 'Here is the relevant information from your network.',
        contactIds: replyContactIds.length > 0 ? replyContactIds : undefined,
        chips: replyChips.length > 0 ? replyChips : undefined,
        sources: sources.length ? sources : undefined,
        confirm: confirmation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : '';
      const isLimit = rawMessage.includes('limit') || (err as { code?: string })?.code === 'resource-exhausted';
      if (isLimit) {
        setLimitOpen(true);
      }
      const text = rawMessage
        ? rawMessage.replace(/^FirebaseError:\s*/, '')
        : 'I could not process that request right now. Please check your network connection.';

      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickReply = (chipText: string) => {
    sendMessage(chipText);
  };

  const decideAIAction = async (messageId: string, pendingActionId: string, decision: 'confirm' | 'cancel' | 'undo') => {
    try {
      await confirmAIAsync({ pendingActionId, decision });
      const status = decision === 'confirm' ? 'Saved' : decision === 'undo' ? 'Undone' : 'Cancelled';
      setMessages((previous) => previous.map((message) =>
        message.id === messageId && message.confirm
          ? { ...message, confirm: { ...message.confirm, status, undoable: decision === 'confirm' } }
          : message
      ));
    } catch (error: unknown) {
      setMessages((previous) => [...previous, {
        id: `err_${Date.now()}`,
        role: 'assistant',
        text: error instanceof Error ? error.message : 'Could not update the proposed action.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 md:py-6 flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <ScreenHeader
        title={
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-accentTint flex items-center justify-center text-accent">
              <IconSparkles size={16} />
            </span>
            <span>Ask Recallr</span>
          </div>
        }
        subtitle="Network recall assistant grounded in your contacts & notes"
        rightAction={
          !isPro ? (
            <button
              type="button"
              onClick={() => setLimitOpen(true)}
              className="px-2.5 py-1 rounded-full bg-accentTint text-accentDark text-[10px] font-medium hover:bg-accent hover:text-white transition-colors"
            >
              5 AI queries/day
            </button>
          ) : undefined
        }
      />

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-accentTint flex items-center justify-center text-accent">
              <IconSparkles size={24} />
            </div>
            <h3 className="text-base font-medium text-text">What would you like to recall?</h3>
            <p className="text-xs text-textSecondary max-w-sm">
              Ask about anyone in your network, find suppliers, or ask who you met at a recent event.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2 max-w-md">
              {[
                'Who are my key suppliers?',
                'Who did I meet recently?',
                'Who works in tech or engineering?',
                'Summarize my follow-ups',
              ].map((suggestion) => (
                <Chip key={suggestion} onClick={() => sendMessage(suggestion)}>
                  {suggestion}
                </Chip>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-[18px] p-3.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-accent text-white rounded-br-[4px]'
                    : 'bg-white border border-border text-text rounded-bl-[4px] shadow-xs'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Embedded Contact Cards if referenced by AI */}
                {msg.contactIds && msg.contactIds.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.contactIds.map((cId) => {
                      const contact = contactMap.get(cId);
                      if (!contact) return null;
                      return (
                        <Card
                          key={cId}
                          onClick={() => router.push(`/people/${contact.id}`)}
                          className="relative p-3 bg-bg hover:bg-fill/60 border border-border cursor-pointer transition-colors"
                        >
                          <OrangeCorner
                            size="sm"
                            onClick={() => router.push(`/people/${contact.id}`)}
                            title="View Contact"
                          >
                            <IconArrowUpRight size={14} stroke={2.4} />
                          </OrangeCorner>
                          <div className="flex items-center gap-2.5 pr-8">
                            <Avatar name={contact.name} size="sm" />
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-medium text-text block truncate">
                                {contact.name}
                              </span>
                              {(contact.role || contact.company) && (
                                <span className="text-[11px] text-textSecondary block truncate">
                                  {contact.role} {contact.role && contact.company ? '•' : ''} {contact.company}
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 text-[11px] text-textMuted">
                    <IconFileText size={14} />
                    <span>{msg.sources.join(' · ')}</span>
                  </div>
                )}

                {msg.confirm && (
                  <div className={`mt-3 p-3 rounded-card border ${msg.confirm.destructive ? 'border-danger bg-dangerTint' : 'border-accentTint bg-accentTintSoft'}`}>
                    <div className="text-xs font-semibold text-text mb-2">{msg.confirm.title}</div>
                    <div className="space-y-1.5">
                      {msg.confirm.rows.map((row, index) => (
                        <div key={`${row.label}-${index}`} className="flex justify-between gap-3 text-[11px]">
                          <span className="text-textSecondary capitalize">{row.label}</span>
                          <span className="text-text font-medium text-right">{row.value}{row.new ? ' · New' : ''}</span>
                        </div>
                      ))}
                    </div>
                    {msg.confirm.status ? (
                      <div className="mt-2 flex items-center justify-between text-xs font-medium text-success"><span>{msg.confirm.status}</span>{msg.confirm.status === 'Saved' && msg.confirm.undoable && <button type="button" disabled={isConfirming} onClick={() => void decideAIAction(msg.id, msg.confirm!.id, 'undo')} className="rounded px-2 py-1 text-accent hover:bg-accentTint disabled:opacity-50">Undo</button>}</div>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={isConfirming}
                          onClick={() => void decideAIAction(msg.id, msg.confirm!.id, 'cancel')}
                          className="h-9 px-4 rounded-button border border-border bg-white text-xs font-medium text-text disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isConfirming}
                          onClick={() => void decideAIAction(msg.id, msg.confirm!.id, 'confirm')}
                          className={`h-9 px-4 rounded-button text-xs font-medium text-white disabled:opacity-50 ${msg.confirm.destructive ? 'bg-danger' : 'bg-accent'}`}
                        >
                          {isConfirming ? 'Saving…' : msg.confirm.destructive ? 'Delete' : 'Confirm'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Action Chips */}
                {msg.chips && msg.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-divider">
                    {msg.chips.map((chipText, idx) => (
                      <Chip
                        key={idx}
                        variant="default"
                        onClick={() => handleQuickReply(chipText)}
                      >
                        {chipText}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-textMuted mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))
        )}

        {isThinking && (
          <div className="flex items-center gap-2 p-3 bg-white border border-border rounded-[18px] max-w-[200px] text-xs text-textSecondary shadow-xs">
            <IconSparkles size={16} className="text-accent animate-spin" />
            <span>Thinking with Recallr AI...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="relative mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your network..."
          disabled={isThinking}
          className="w-full h-12 pl-4 pr-12 bg-white rounded-card border border-border text-sm text-text placeholder:text-textMuted focus:outline-none focus:border-accent shadow-xs"
        />
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="absolute right-1.5 top-1.5 w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accentPressed transition-colors disabled:opacity-40 disabled:hover:bg-accent"
          aria-label="Send query"
        >
          <IconArrowUp size={18} />
        </button>
      </form>

      <LimitReachedSheet
        isOpen={limitOpen}
        onClose={() => setLimitOpen(false)}
        type="ai"
      />
    </div>
  );
}

export default function AskRecallrPage() {
  return (
    <Suspense fallback={null}>
      <AskRecallrContent />
    </Suspense>
  );
}

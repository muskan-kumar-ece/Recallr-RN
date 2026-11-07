'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import {
  IconMail,
  IconClock,
  IconMapPin,
  IconShieldCheck,
  IconSend,
  IconCheck,
} from '@tabler/icons-react';

export default function ContactUsPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setToastMessage('Please fill in all required fields.');
      setToastVisible(true);
      return;
    }

    setSubmitted(true);
    setToastMessage('Thank you! Your inquiry has been received. We will respond within 24 hours.');
    setToastVisible(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <ScreenHeader
        title="Contact Us"
        subtitle="We're here to help you with your account and subscriptions"
        onBack={() => router.back()}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contact Info Sidebar */}
        <div className="space-y-3 md:col-span-1">
          <Card className="bg-white border border-border p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accentTint text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconMail size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-text">Customer Support</p>
                <a href="mailto:support@recallr.app" className="text-xs text-accent underline break-all">
                  support@recallr.app
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-divider">
              <div className="w-8 h-8 rounded-full bg-accentTint text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconClock size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-text">Response Hours</p>
                <p className="text-xs text-textSecondary">Monday – Saturday</p>
                <p className="text-[11px] text-textMuted">9:00 AM – 7:00 PM IST</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-divider">
              <div className="w-8 h-8 rounded-full bg-accentTint text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconMapPin size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-text">Operating Address</p>
                <p className="text-xs text-textSecondary leading-relaxed">
                  Recallr Technologies<br />
                  Bangalore, Karnataka 560001<br />
                  India
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border border-border p-4">
            <div className="flex items-center gap-2 text-textSecondary text-xs">
              <IconShieldCheck size={18} className="text-accent flex-shrink-0" />
              <span>Payments secured by Razorpay India.</span>
            </div>
          </Card>
        </div>

        {/* Message Form */}
        <Card className="bg-white border border-border p-5 sm:p-6 md:col-span-2">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-accentTint text-accent flex items-center justify-center mx-auto">
                <IconCheck size={28} />
              </div>
              <h3 className="text-base font-semibold text-text">Message Received</h3>
              <p className="text-xs text-textSecondary max-w-sm mx-auto leading-relaxed">
                Thank you for reaching out. Our support desk has logged your request and will get back to you at <strong>{email}</strong> within 24 business hours.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setSubject('');
                  setMessage('');
                }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-text mb-1">Send us an Inquiry</h3>
                <p className="text-xs text-textSecondary">
                  Have a question about your Pro subscription, billing, or feature request?
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full h-10 px-3 bg-bg rounded-input border border-border text-xs text-text placeholder:text-textMuted focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-10 px-3 bg-bg rounded-input border border-border text-xs text-text placeholder:text-textMuted focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Question about Pro Annual Plan / Billing"
                  className="w-full h-10 px-3 bg-bg rounded-input border border-border text-xs text-text placeholder:text-textMuted focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry or include your Razorpay payment ID if regarding a transaction..."
                  className="w-full p-3 bg-bg rounded-input border border-border text-xs text-text placeholder:text-textMuted focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={<IconSend size={16} />}
                style={{ width: '100%' }}
              >
                Submit Message
              </Button>
            </form>
          )}
        </Card>
      </div>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        actionText="Close"
        onAction={() => setToastVisible(false)}
      />
    </div>
  );
}

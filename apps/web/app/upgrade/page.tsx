'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconCrown,
  IconCheck,
  IconShieldCheck,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { OrangeCorner } from '@/components/ui/OrangeCorner';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Toast } from '@/components/ui/Toast';
import { useRecallrAuth } from '@/providers/RecallrProvider';
import { createRazorpayOrder, verifyRazorpayPayment } from '@recallr/api';
import { PRICING } from '@recallr/core';

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export default function UpgradePage() {
  const router = useRouter();
  const { user } = useRecallrAuth();
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const features = [
    'Unlimited contacts and categories',
    'Unlimited business card scanning with instant OCR',
    'Full AI memory recall & contextual conversation assistant',
    'Automated follow-up cadences and quiet-hour digests',
    'Public digital card with customizable accent themes',
    'Cloud backup & instant sync across iOS, Android and Web',
  ];

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if (window.Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    const planKey = billingCycle === 'yearly' ? 'pro_yearly' : 'pro_monthly';

    try {
      const orderData = await createRazorpayOrder(planKey);

      // Load checkout.js
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load Razorpay checkout SDK. Check internet connection.');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Recallr',
        description:
          billingCycle === 'yearly'
            ? `Recallr Pro Yearly (₹${PRICING.yearlyINR}/year)`
            : `Recallr Pro Monthly (₹${PRICING.monthlyINR}/month)`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#E8641B', // Recallr brand accent orange
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyRazorpayPayment({
              ...response,
              plan: planKey,
            });

            setToastMessage('Payment successful! Welcome to Recallr Pro.');
            setToastVisible(true);
            setTimeout(() => {
              router.push('/settings/subscription');
            }, 1500);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Payment verification failed';
            setToastMessage(msg);
            setToastVisible(true);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to initialize');
      }

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to initiate payment';
      setToastMessage(msg);
      setToastVisible(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4 md:py-6 space-y-4">
      <ScreenHeader
        title=""
        onBack={() => router.back()}
        closeIcon
      />

      {/* Hero Badge */}
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-[18px] bg-accentTint flex items-center justify-center text-accent mb-3 shadow-sm">
          <IconCrown size={28} />
        </div>
        <h1 className="text-2xl font-medium text-text">Unlock Recallr Pro</h1>
        <p className="text-xs sm:text-sm text-textSecondary max-w-xs mt-1 leading-relaxed">
          Never forget a contact, note, or follow-up. Supercharge your professional network.
        </p>
      </div>

      {/* Feature Checklist */}
      <Card className="bg-white border border-border p-5 space-y-3">
        {features.map((feat, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-accentTint flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
              <IconCheck size={12} stroke={3} />
            </div>
            <span className="text-xs sm:text-sm text-text leading-snug">{feat}</span>
          </div>
        ))}
      </Card>

      {/* Billing Selector */}
      <div className="flex justify-center py-1">
        <SegmentedControl
          options={[
            { label: 'Yearly (Save 33%)', value: 'yearly' },
            { label: 'Monthly', value: 'monthly' },
          ]}
          value={billingCycle}
          onChange={setBillingCycle}
        />
      </div>

      {/* Pricing Card */}
      <Card className="relative p-5 bg-white border-2 border-accent rounded-card overflow-hidden text-center shadow-sm">
        <OrangeCorner size="sm">
          <IconCheck size={14} stroke={3} />
        </OrangeCorner>

        <div className="text-xs font-medium text-accent uppercase tracking-wider mb-1">
          {billingCycle === 'yearly' ? 'Best Value Plan' : 'Flexible Monthly'}
        </div>

        <div className="flex items-baseline justify-center gap-1 my-1">
          <span className="text-3xl font-medium text-text">
            {billingCycle === 'yearly' ? `₹${Math.round(PRICING.yearlyINR / 12)}` : `₹${PRICING.monthlyINR}`}
          </span>
          <span className="text-xs text-textSecondary">/ month</span>
        </div>

        <p className="text-[11px] text-textMuted">
          {billingCycle === 'yearly'
            ? `Billed annually at ₹${PRICING.yearlyINR} / year. UPI, Cards & NetBanking supported.`
            : `Billed monthly at ₹${PRICING.monthlyINR} / month. Cancel anytime.`}
        </p>

        <div className="mt-4">
          <Button
            variant="primary"
            size="md"
            onClick={handleRazorpayPayment}
            disabled={isProcessing}
            style={{ width: '100%' }}
          >
            {isProcessing ? 'Connecting to Razorpay...' : `Pay ₹${billingCycle === 'yearly' ? PRICING.yearlyINR : PRICING.monthlyINR} with Razorpay`}
          </Button>
        </div>

        <p className="text-[10px] text-textMuted mt-2.5 flex items-center justify-center gap-1">
          <IconShieldCheck size={14} />
          <span>Secured with 256-bit encryption by Razorpay (UPI, GPay, PhonePe, Cards)</span>
        </p>
      </Card>

      {/* Razorpay Merchant Compliance Policy Links */}
      <div className="pt-2 pb-6 text-center text-xs text-textMuted space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Link href="/terms" className="hover:text-text underline">
            Terms &amp; Conditions
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-text underline">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/shipping" className="hover:text-text underline">
            Shipping Policy
          </Link>
          <span>•</span>
          <Link href="/refund" className="hover:text-text underline">
            Cancellation &amp; Refunds
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-text underline">
            Contact Us
          </Link>
        </div>
        <p className="text-[11px] text-textMuted">
          Recallr © 2026. All rights reserved. Payments powered by Razorpay.
        </p>
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

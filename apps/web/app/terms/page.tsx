'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';

export default function TermsAndConditionsPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <ScreenHeader
        title="Terms and Conditions"
        subtitle="Last updated: November 2026"
        onBack={() => router.back()}
      />

      <Card className="bg-white border border-border p-6 sm:p-8 space-y-6 text-sm text-text leading-relaxed">
        <div>
          <h2 className="text-base font-semibold text-text mb-2">1. Agreement to Terms</h2>
          <p className="text-textSecondary">
            By accessing or using Recallr (&quot;the Service&quot;), available via our website and mobile applications, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access or use the Service.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">2. Description of Service</h2>
          <p className="text-textSecondary">
            Recallr provides personal relationship management (CRM) software, digital business card sharing, optical character recognition (OCR) business card scanning, and AI-assisted contextual contact recall. The Service is offered on free and paid (&quot;Pro&quot;) subscription tiers.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">3. User Accounts &amp; Security</h2>
          <p className="text-textSecondary">
            You are responsible for maintaining the confidentiality of your account credentials (email, password, phone OTP) and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use or security breach.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">4. Subscriptions &amp; Payments</h2>
          <p className="text-textSecondary">
            Paid subscription plans (Pro Monthly at ₹149/month and Pro Yearly at ₹1,199/year) are billed in advance in Indian Rupees (INR) through our authorized payment gateway partner, <strong>Razorpay</strong>. By selecting a subscription, you authorize Razorpay and Recallr to process applicable fees using your selected payment method (UPI, Debit/Credit Card, NetBanking).
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">5. User Data &amp; Privacy</h2>
          <p className="text-textSecondary">
            Your contact information, uploaded notes, and scanned documents remain your private property. Recallr does not sell or distribute your private CRM data to third parties. For full details on data handling and encryption, please review our{' '}
            <Link href="/privacy" className="text-accent underline font-medium">
              Privacy Policy
            </Link>.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">6. Intellectual Property</h2>
          <p className="text-textSecondary">
            The Service and its original content, features, design system, and functionality are the exclusive property of Recallr and its licensors, protected by copyright, trademark, and other applicable intellectual property laws.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">7. Limitation of Liability</h2>
          <p className="text-textSecondary">
            To the maximum extent permitted by applicable law, Recallr shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or inability to use the Service.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">8. Governing Law</h2>
          <p className="text-textSecondary">
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any legal disputes shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">9. Contact Us</h2>
          <p className="text-textSecondary">
            If you have questions regarding these Terms, please contact our support team at{' '}
            <Link href="/contact" className="text-accent underline font-medium">
              Contact Us
            </Link>{' '}
            or email <a href="mailto:support@recallr.app" className="text-accent underline">support@recallr.app</a>.
          </p>
        </div>
      </Card>
    </div>
  );
}

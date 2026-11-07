'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <ScreenHeader
        title="Privacy Policy"
        subtitle="Last updated: November 2026"
        onBack={() => router.back()}
      />

      <Card className="bg-white border border-border p-6 sm:p-8 space-y-6 text-sm text-text leading-relaxed">
        <div>
          <h2 className="text-base font-semibold text-text mb-2">1. Overview</h2>
          <p className="text-textSecondary">
            Recallr (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your personal privacy and the confidentiality of your professional network. This Privacy Policy explains what information we collect, how it is used, and how your data is secured.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">2. Information We Collect</h2>
          <div className="space-y-2 text-textSecondary">
            <p><strong>Account Information:</strong> When you register, we collect your email address, phone number, and name to manage authentication.</p>
            <p><strong>CRM &amp; Contact Records:</strong> Names, job titles, companies, phone numbers, email addresses, meeting context (&quot;how you met&quot;), and custom notes you choose to store.</p>
            <p><strong>Scanned Business Cards:</strong> Images of physical business cards you scan using our camera OCR feature, which are processed to extract contact details.</p>
            <p><strong>Payment Data:</strong> Payment transactions are handled directly by our certified payment partner, <strong>Razorpay</strong>. Recallr never stores your full credit card, debit card, or UPI PIN credentials on our servers.</p>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1.5 text-textSecondary">
            <li>To provide and maintain your personal CRM and relationship timeline.</li>
            <li>To power contextual search and AI recall queries across your own saved notes.</li>
            <li>To generate and host your public digital business card at your chosen slug (e.g., <code>/c/[slug]</code>).</li>
            <li>To send automated follow-up digests and reminder notifications.</li>
            <li>To process your subscription upgrades and renewals via Razorpay.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">4. Data Security &amp; Encryption</h2>
          <p className="text-textSecondary">
            All data transmitted between your device and Recallr is encrypted in transit using industry-standard TLS 1.3 encryption. Your stored database records and uploaded images are encrypted at rest on Google Cloud / Cloud Firestore. Security rules enforce strict user-level isolation so that only you can access your private contacts and notes.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">5. Third-Party Service Providers</h2>
          <p className="text-textSecondary">
            We work with trusted enterprise cloud infrastructure providers to operate the service:
          </p>
          <ul className="list-disc list-inside space-y-1 text-textSecondary mt-2">
            <li><strong>Google Cloud / Firebase:</strong> Authentication, encrypted Firestore database, and Cloud Storage.</li>
            <li><strong>Razorpay:</strong> Secure payment processing for Indian and international payments.</li>
            <li><strong>Google Gemini Flash:</strong> Vision OCR extraction and context-grounded AI assistant.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">6. Your Rights &amp; Data Deletion</h2>
          <p className="text-textSecondary">
            You retain full ownership of your data. You may export your contacts at any time via CSV/vCard. You may also permanently delete your account and all associated cloud data via <strong>Settings &gt; Delete Account</strong>, which triggers an irreversible full erasure across our authentication, database, and storage systems.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">7. Contact Details</h2>
          <p className="text-textSecondary">
            For privacy inquiries or data requests, please visit our{' '}
            <Link href="/contact" className="text-accent underline font-medium">
              Contact Us
            </Link>{' '}
            page or email <a href="mailto:privacy@recallr.app" className="text-accent underline">privacy@recallr.app</a>.
          </p>
        </div>
      </Card>
    </div>
  );
}

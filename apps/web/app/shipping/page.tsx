'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { IconBolt, IconShieldCheck, IconDeviceLaptop } from '@tabler/icons-react';

export default function ShippingPolicyPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <ScreenHeader
        title="Shipping & Delivery Policy"
        subtitle="Last updated: November 2026"
        onBack={() => router.back()}
      />

      <Card className="bg-white border border-border p-6 sm:p-8 space-y-6 text-sm text-text leading-relaxed">
        {/* Quick Highlights Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-card bg-bg border border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accentTint text-accent flex items-center justify-center flex-shrink-0">
              <IconBolt size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text">Instant Delivery</p>
              <p className="text-[11px] text-textSecondary">Active in seconds</p>
            </div>
          </div>

          <div className="p-3.5 rounded-card bg-bg border border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accentTint text-accent flex items-center justify-center flex-shrink-0">
              <IconDeviceLaptop size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text">100% Digital SaaS</p>
              <p className="text-[11px] text-textSecondary">Web, iOS & Android</p>
            </div>
          </div>

          <div className="p-3.5 rounded-card bg-bg border border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accentTint text-accent flex items-center justify-center flex-shrink-0">
              <IconShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text">Automated Setup</p>
              <p className="text-[11px] text-textSecondary">No physical shipping</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">1. Nature of Service (Digital Delivery)</h2>
          <p className="text-textSecondary">
            Recallr is a cloud-based Software-as-a-Service (SaaS) application. We provide digital software services, including contact management, business card scanning, AI assistant recall, and digital business cards. <strong>We do not ship physical products or tangible goods.</strong> Consequently, physical postal shipping charges, courier delivery times, and physical logistics do not apply to purchases made on Recallr.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">2. Delivery Method &amp; Fulfillment Timeline</h2>
          <p className="text-textSecondary">
            Upon successful payment confirmation via our payment gateway (<strong>Razorpay</strong>):
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-textSecondary mt-2">
            <li><strong>Delivery Timeline:</strong> Instantaneous (typically within 5 to 60 seconds of transaction completion).</li>
            <li><strong>Fulfillment Mode:</strong> Your Recallr Pro subscription is automatically provisioned and activated on your account.</li>
            <li><strong>Confirmation:</strong> An automated digital payment receipt and invoice containing your transaction details will be sent to your registered email address.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">3. How to Access Your Subscription</h2>
          <p className="text-textSecondary">
            To start using your Pro features immediately following payment:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-textSecondary mt-2">
            <li>Log in to Recallr on the Web at <a href="https://recallr-72d38.web.app" className="text-accent underline">recallr-72d38.web.app</a> or open the Recallr Mobile App on iOS or Android.</li>
            <li>Navigate to <strong>Settings &gt; Subscription</strong> to verify your active Pro status and renewal date.</li>
            <li>All Pro capabilities—including unlimited contact limits, unlimited card scanning, and full AI memory recall—are immediately accessible.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">4. Support for Delivery Issues</h2>
          <p className="text-textSecondary">
            If your account does not reflect your upgraded Pro subscription within 5 minutes of completing your Razorpay payment, please contact our support desk immediately:
          </p>
          <ul className="list-disc list-inside space-y-1 text-textSecondary mt-2">
            <li>Email: <a href="mailto:support@recallr.app" className="text-accent underline font-medium">support@recallr.app</a></li>
            <li>Support Page:{' '}
              <Link href="/contact" className="text-accent underline font-medium">
                Contact Us
              </Link>
            </li>
          </ul>
          <p className="text-textSecondary mt-2">
            Please include your <strong>Razorpay Payment ID</strong> (e.g., <code>pay_...</code>) so we can locate your record and verify activation immediately.
          </p>
        </div>
      </Card>
    </div>
  );
}

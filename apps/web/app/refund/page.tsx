'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { IconRotateClockwise, IconCreditCard, IconShieldCheck } from '@tabler/icons-react';

export default function CancellationAndRefundsPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <ScreenHeader
        title="Cancellation & Refund Policy"
        subtitle="Last updated: November 2026"
        onBack={() => router.back()}
      />

      <Card className="bg-white border border-border p-6 sm:p-8 space-y-6 text-sm text-text leading-relaxed">
        {/* Policy Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-card bg-bg border border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accentTint text-accent flex items-center justify-center flex-shrink-0">
              <IconRotateClockwise size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text">7-Day Guarantee</p>
              <p className="text-[11px] text-textSecondary">Annual Pro plans</p>
            </div>
          </div>

          <div className="p-3.5 rounded-card bg-bg border border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accentTint text-accent flex items-center justify-center flex-shrink-0">
              <IconCreditCard size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text">5–7 Business Days</p>
              <p className="text-[11px] text-textSecondary">Refund to source</p>
            </div>
          </div>

          <div className="p-3.5 rounded-card bg-bg border border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accentTint text-accent flex items-center justify-center flex-shrink-0">
              <IconShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text">Cancel Anytime</p>
              <p className="text-[11px] text-textSecondary">In-app settings</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">1. Subscription Cancellation Policy</h2>
          <p className="text-textSecondary">
            You may cancel your Recallr Pro subscription (Monthly or Yearly) at any time directly through the application:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-textSecondary mt-2">
            <li>Go to <strong>Settings &gt; Subscription</strong>.</li>
            <li>Select <strong>Cancel Subscription</strong> and confirm your choice.</li>
            <li>Upon cancellation, your Pro features will remain active until the end of your current paid billing period. Your account will not be charged again at the next renewal cycle, and will automatically revert to the Free plan.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">2. Refund Eligibility Criteria</h2>
          <div className="space-y-2 text-textSecondary">
            <p>
              <strong>7-Day Money-Back Guarantee (Pro Yearly):</strong> If you purchase an annual Recallr Pro plan (₹1,199/year) and are not completely satisfied, you are eligible for a full 100% refund if requested within <strong>7 days</strong> of your initial purchase date.
            </p>
            <p>
              <strong>Duplicate / Accidental Charges:</strong> If you were accidentally charged more than once for the same subscription period due to a network or technical failure, we will immediately issue a full refund for the duplicate transaction.
            </p>
            <p>
              <strong>Monthly Plans:</strong> Monthly subscriptions (₹149/month) are non-refundable once the billing period has commenced; however, you can cancel renewal anytime to stop future monthly billings.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">3. How to Request a Refund</h2>
          <p className="text-textSecondary">
            To request a refund under the eligible criteria:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-textSecondary mt-2">
            <li>Send an email to <a href="mailto:support@recallr.app" className="text-accent underline font-medium">support@recallr.app</a> or submit a ticket via our{' '}
              <Link href="/contact" className="text-accent underline font-medium">
                Contact Us
              </Link>{' '}page.
            </li>
            <li>Provide your <strong>registered email address</strong> and your <strong>Razorpay Payment ID</strong> (e.g., <code>pay_...</code>).</li>
            <li>Briefly state the reason for your refund request.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">4. Refund Processing Timeline</h2>
          <p className="text-textSecondary">
            Once your refund request is reviewed and approved by our billing team:
          </p>
          <ul className="list-disc list-inside space-y-1 text-textSecondary mt-2">
            <li>The refund is processed via the <strong>Razorpay API</strong> back to the original source payment method (original UPI ID, debit card, credit card, or net banking account).</li>
            <li>It typically takes <strong>5 to 7 business days</strong> for the funds to reflect in your bank account or credit card statement, depending on your bank&apos;s settlement timelines.</li>
            <li>You will receive an automated refund confirmation email from Razorpay with the refund reference number.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text mb-2">5. Contact Support</h2>
          <p className="text-textSecondary">
            For any queries regarding cancellations, billing discrepancies, or refund status, please visit{' '}
            <Link href="/contact" className="text-accent underline font-medium">
              Contact Us
            </Link>{' '}
            or write to <a href="mailto:support@recallr.app" className="text-accent underline">support@recallr.app</a>.
          </p>
        </div>
      </Card>
    </div>
  );
}

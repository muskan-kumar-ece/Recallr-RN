import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { RecallrProvider } from '@/providers/RecallrProvider';
import { ThemeSync } from '@/components/ThemeSync';

export const metadata: Metadata = {
  title: 'Recallr - AI Personal CRM',
  description: 'Remember everyone you meet: contacts, notes, reminders, and AI-powered recall.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-text min-h-screen">
        <RecallrProvider>
          <ThemeSync />
          <AppShell>{children}</AppShell>
        </RecallrProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

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
        {children}
      </body>
    </html>
  );
}

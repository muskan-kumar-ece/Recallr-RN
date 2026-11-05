import { IconSparkles, IconUserCheck, IconNotebook, IconId } from '@tabler/icons-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-surface rounded-card p-6 border border-border shadow-sm relative overflow-hidden">
        {/* Signature Orange Corner */}
        <div
          className="absolute bottom-0 right-0 w-[78px] h-[58px] bg-accent rounded-tl-[40px] flex items-end justify-end p-3 text-white"
          aria-hidden="true"
        >
          <IconSparkles size={22} />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accentTint flex items-center justify-center text-accent">
            <IconUserCheck size={22} />
          </div>
          <div>
            <h1 className="text-xl font-medium text-text">Recallr Web</h1>
            <p className="text-xs text-textSecondary">Smart Personal CRM & Network AI</p>
          </div>
        </div>

        <p className="text-sm text-textSecondary mb-6 leading-relaxed">
          Welcome to Recallr on Web. Built with Next.js App Router, Tailwind CSS, and strict design token parity with mobile.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-bg border border-border flex items-center gap-2">
            <IconNotebook size={18} className="text-accent" />
            <span className="text-xs font-medium text-text">Notes & Reminders</span>
          </div>
          <div className="p-3 rounded-xl bg-bg border border-border flex items-center gap-2">
            <IconId size={18} className="text-accent" />
            <span className="text-xs font-medium text-text">Digital Card</span>
          </div>
        </div>

        <div className="text-[11px] text-textMuted pt-2 border-t border-border">
          Status: Phase M0 Monorepo Scaffolded
        </div>
      </div>
    </main>
  );
}

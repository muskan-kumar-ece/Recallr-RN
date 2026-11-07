'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconScan,
  IconSparkles,
  IconUpload,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Toast } from '@/components/ui/Toast';
import { LimitReachedSheet } from '@/components/ui/LimitReachedSheet';
import {
  deleteStorageFile,
  getCurrentUserId,
  scanBusinessCard,
  uploadStorageFile,
  useEntitlements,
  useUsageCounters,
} from '@recallr/api';

async function compressCardImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Could not read image file');
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not read image file'));
    }, 'image/jpeg', 0.85);
  });
}

export default function ScanCardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: entitlements } = useEntitlements();
  const { data: usageCounters } = useUsageCounters();

  const [isScanning, setIsScanning] = useState(false);
  const [scanLimitOpen, setScanLimitOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const isPro = entitlements?.plan === 'pro';
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const scanCount = usageCounters?.find((u) => u.kind === 'scan' && u.period_key === currentMonthKey)?.count ?? 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const mimeType = (['image/jpeg', 'image/png', 'image/webp'] as const)
      .find((supportedType) => supportedType === file.type);
    if (!mimeType || file.size > 9_000_000) {
      setToastMessage('Upload a JPEG, PNG, or WebP card image up to 9 MB.');
      setToastVisible(true);
      return;
    }

    if (!isPro && scanCount >= 10) {
      setScanLimitOpen(true);
      return;
    }

    setIsScanning(true);

    let photoPreview = '';
    let storagePath = '';
    let uploadComplete = false;
    try {
      const compressedImage = await compressCardImage(file);
      if (compressedImage.size > 9_000_000) {
        throw new Error('Upload a JPEG, PNG, or WebP card image up to 9 MB.');
      }
      photoPreview = URL.createObjectURL(compressedImage);
      storagePath = `users/${getCurrentUserId()}/cards/scan-${crypto.randomUUID()}.jpg`;
      await uploadStorageFile(storagePath, compressedImage);
      uploadComplete = true;
      const extracted = await scanBusinessCard(storagePath);

      sessionStorage.setItem(
        'pending_scanned_contact',
        JSON.stringify({ ...extracted, card_image_path: storagePath, photoPreview })
      );
      router.push('/scan-review');
    } catch (err: unknown) {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      if (uploadComplete && storagePath) {
        await deleteStorageFile(storagePath).catch(() => undefined);
      }
      const msg = err instanceof Error ? err.message : 'OCR extraction failed';
      setToastMessage(msg);
      setToastVisible(true);
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
      <ScreenHeader
        title="Scan Business Card"
        subtitle="Capture or upload a photo to extract contact details with AI OCR"
        onBack={() => router.back()}
        rightAction={
          !isPro ? (
            <button
              type="button"
              onClick={() => setScanLimitOpen(true)}
              className="px-2.5 py-1 rounded-full bg-accentTint text-accentDark text-[10px] font-medium hover:bg-accent hover:text-white transition-colors"
              title="Monthly scan quota"
            >
              {scanCount}/10 scans
            </button>
          ) : undefined
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload Zone */}
      <Card
        onClick={() => !isScanning && fileInputRef.current?.click()}
        className="p-10 bg-white border-2 border-dashed border-border hover:border-accent cursor-pointer transition-colors flex flex-col items-center justify-center text-center"
      >
        <div className="w-16 h-16 rounded-[20px] bg-accentTint flex items-center justify-center text-accent mb-3.5">
          {isScanning ? (
            <IconSparkles size={32} className="animate-spin text-accent" />
          ) : (
            <IconScan size={32} />
          )}
        </div>
        <h3 className="text-base font-medium text-text">
          {isScanning
            ? 'Analyzing business card with Gemini AI...'
            : 'Capture or Upload Card Photo'}
        </h3>
        <p className="text-xs text-textSecondary max-w-xs mt-1.5 leading-relaxed">
          {isScanning
            ? 'Extracting name, company, phone, email, and address...'
            : 'Click to take a camera photo or drag and drop a card image here.'}
        </p>

        {!isScanning && (
          <div className="mt-4 flex items-center gap-1.5 text-xs text-accent font-medium">
            <IconUpload size={16} />
            <span>Select Image File</span>
          </div>
        )}
      </Card>

      <LimitReachedSheet
        isOpen={scanLimitOpen}
        onClose={() => setScanLimitOpen(false)}
        type="scans"
      />

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        actionText="Close"
        onAction={() => setToastVisible(false)}
      />
    </div>
  );
}

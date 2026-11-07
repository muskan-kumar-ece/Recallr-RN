'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconDownload,
  IconShare,
  IconDotsVertical,
  IconPencil,
  IconFolderSymlink,
  IconTrash,
  IconExternalLink,
  IconCalendar,
  IconFile,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { FieldRow } from '@/components/ui/FieldRow';
import { useContact, useContactDocument, useContacts, useDeleteContactDocument, useRestoreContactDocument, useUpdateContactDocument } from '@recallr/api';
import { useRouteParam } from '@/hooks/useRouteParam';

export default function DocumentViewerClient() {
  const router = useRouter();
  const docId = useRouteParam('id');
  const { data: file } = useContactDocument(docId || '');
  const { data: contact } = useContact(file?.contact_id || '');
  const { data: contacts = [] } = useContacts();
  const { mutateAsync: updateDocument } = useUpdateContactDocument();
  const { mutateAsync: deleteDocument } = useDeleteContactDocument();
  const { mutateAsync: restoreDocument } = useRestoreContactDocument();
  const [docTitle, setDocTitle] = useState('Document');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameInput, setRenameInput] = useState(docTitle);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  useEffect(() => {
    if (file?.name) {
      setDocTitle(file.name);
      setRenameInput(file.name);
    }
  }, [file?.name]);

  const handleShare = () => {
    if (navigator?.share) {
      void navigator.share({ title: docTitle, url: file?.download_url || window.location.href });
    } else {
      void navigator?.clipboard?.writeText(file?.download_url || window.location.href);
      setToastMessage('Document link copied to clipboard');
      setToastVisible(true);
    }
  };

  const handleDelete = async () => {
    if (!file?.id) return;
    try {
      await deleteDocument(file.id);
      setIsDeleted(true);
      setIsMoreMenuOpen(false);
      setToastMessage(`"${docTitle}" deleted`);
      setToastVisible(true);
    } catch (error: unknown) {
      setToastMessage(error instanceof Error ? error.message : 'Could not delete document');
      setToastVisible(true);
    }
  };

  const handleUndoDelete = async () => {
    if (!file?.id || !isDeleted) return;
    try {
      await restoreDocument(file.id);
      setIsDeleted(false);
      setToastVisible(false);
    } catch (error: unknown) {
      setToastMessage(error instanceof Error ? error.message : 'Could not restore document');
    }
  };

  const handleSaveRename = async () => {
    if (!file?.id || !renameInput.trim()) return;
    try {
      await updateDocument({ id: file.id, changes: { name: renameInput.trim() } });
      setDocTitle(renameInput.trim());
      setIsRenameOpen(false);
      setToastMessage('Document renamed');
      setToastVisible(true);
    } catch (error: unknown) {
      setToastMessage(error instanceof Error ? error.message : 'Could not rename document');
      setToastVisible(true);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 md:py-6 space-y-4">
      <ScreenHeader
        title={docTitle}
        subtitle={file ? `${(file.size_bytes / 1024).toFixed(0)} KB · Added ${new Date(file.created_at).toLocaleDateString('en-IN')}` : 'Loading document'}
        onBack={() => router.back()}
        rightAction={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-textSecondary hover:text-text transition-colors"
              aria-label="Share"
            >
              <IconShare size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(true)}
              className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-textSecondary hover:text-text transition-colors"
              aria-label="Document options"
            >
              <IconDotsVertical size={18} />
            </button>
          </div>
        }
      />

      {/* Action Tiles */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={handleShare}
          className="flex flex-col items-center justify-center p-3 rounded-card bg-white border border-border hover:border-accent/40 hover:bg-accentTintSoft transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-accentTint text-accent flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <IconShare size={20} />
          </div>
          <span className="text-xs font-medium text-text">Share</span>
        </button>

        <button
          type="button"
          onClick={() => { if (file?.download_url) window.open(file.download_url, '_blank', 'noopener,noreferrer'); }}
          className="flex flex-col items-center justify-center p-3 rounded-card bg-white border border-border hover:border-accent/40 hover:bg-accentTintSoft transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-accentTint text-accent flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <IconExternalLink size={20} />
          </div>
          <span className="text-xs font-medium text-text">Open in</span>
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="flex flex-col items-center justify-center p-3 rounded-card bg-white border border-border hover:border-danger/40 hover:bg-danger/10 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <IconTrash size={20} />
          </div>
          <span className="text-xs font-medium text-danger">Delete</span>
        </button>
      </div>

      {/* Details Card */}
      <div>
        <h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider mb-2 px-1">
          Document Details
        </h3>
        <Card className="bg-white border border-border divide-y divide-divider overflow-hidden">
          {contact && (
            <FieldRow
              label="Attached to"
              value={`${contact.name}${contact.company ? ` (${contact.company})` : ''}`}
              icon={<IconFile size={16} />}
              onClick={() => router.push(`/people/${contact.id}`)}
            />
          )}
          <FieldRow
            label="Added on"
            value={file?.created_at ? new Date(file.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            icon={<IconCalendar size={16} />}
          />
          <FieldRow
            label="File type"
            value={file?.mime_type || '—'}
            icon={<IconDownload size={16} />}
          />
        </Card>
      </div>

      {/* Document Preview Canvas */}
      <Card className="bg-white border border-border p-5 sm:p-6 shadow-sm overflow-hidden space-y-4">
        {file?.mime_type.startsWith('image/') && file.download_url ? (
          <div className="flex flex-col items-center justify-center p-4">
            <img
              src={file.download_url}
              alt={docTitle}
              className="max-h-96 rounded-card object-contain border border-border"
            />
          </div>
        ) : (
          <div className="p-8 text-center text-textSecondary space-y-2">
            <IconFile size={36} className="text-accent mx-auto" />
            <h3 className="text-sm font-medium text-text">{docTitle}</h3>
            <p className="text-xs text-textMuted max-w-sm mx-auto">
              Open this file in a new tab to view or download it.
            </p>
          </div>
        )}
      </Card>

      {/* 3-DOTS MORE MENU BOTTOM SHEET */}
      <BottomSheet
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        title={docTitle}
        isDesktopDialog
      >
        <div className="space-y-1 pb-3">
          <button
            type="button"
            onClick={() => {
              setIsMoreMenuOpen(false);
              setIsRenameOpen(true);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-card text-left text-sm font-medium text-text hover:bg-black/[0.03] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-fill flex items-center justify-center text-textSecondary">
              <IconPencil size={18} />
            </div>
            <span>Rename File</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMoreMenuOpen(false);
            setIsMoveOpen(true);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-card text-left text-sm font-medium text-text hover:bg-black/[0.03] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-fill flex items-center justify-center text-textSecondary">
              <IconFolderSymlink size={18} />
            </div>
            <span>Move to another person</span>
          </button>

          <div className="pt-2 border-t border-divider">
            <button
              type="button"
              onClick={handleDelete}
              className="w-full flex items-center gap-3 p-3 rounded-card text-left text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center text-danger">
                <IconTrash size={18} />
              </div>
              <span>Delete File</span>
            </button>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={isMoveOpen} onClose={() => setIsMoveOpen(false)} title="Move to another person" isDesktopDialog>
        <div className="space-y-2 max-h-80 overflow-y-auto pb-3">
          {contacts.filter((candidate) => candidate.id !== contact?.id).map((candidate) => (
            <button key={candidate.id} type="button" className="w-full text-left p-3 rounded-card hover:bg-pressedRow" onClick={async () => {
              if (!file?.id) return;
              try {
                await updateDocument({ id: file.id, changes: { contact_id: candidate.id } });
                setIsMoveOpen(false);
                router.back();
              } catch (error: unknown) {
                setToastMessage(error instanceof Error ? error.message : 'Could not move document');
                setToastVisible(true);
              }
            }}>{candidate.name}{candidate.company ? ` · ${candidate.company}` : ''}</button>
          ))}
        </div>
      </BottomSheet>

      {/* RENAME MODAL */}
      <BottomSheet
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        title="Rename Document"
        isDesktopDialog
      >
        <div className="space-y-4 pb-2">
          <div>
            <label className="block text-xs text-textSecondary mb-1">File Name</label>
            <input
              type="text"
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleSaveRename}
            style={{ width: '100%' }}
          >
            Save File Name
          </Button>
        </div>
      </BottomSheet>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        actionText={isDeleted ? 'Undo' : 'Close'}
        onAction={isDeleted ? handleUndoDelete : () => setToastVisible(false)}
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconPencil,
  IconFolderSymlink,
  IconGitMerge,
  IconTrash,
  IconCheck,
} from '@tabler/icons-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ContactData } from './ContactProfileView';

export interface ContactMoreMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  contact: ContactData;
  onDelete: () => void;
  onCategoryChanged?: (newCategory: string) => void;
}

export const ContactMoreMenuSheet: React.FC<ContactMoreMenuSheetProps> = ({
  isOpen,
  onClose,
  contact,
  onDelete,
  onCategoryChanged,
}) => {
  const router = useRouter();
  const [isMoveCategoryOpen, setIsMoveCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(contact.category);

  const categories = [
    'Plastic Business',
    'Surat Machinery',
    'Real Estate',
    'Friends & Family',
    'Suppliers',
    'Clients',
  ];

  const handleEdit = () => {
    onClose();
    router.push(`/people/${contact.id}/edit`);
  };

  const handleMerge = () => {
    onClose();
    router.push(`/merge?a=${contact.id}`);
  };

  const handleDelete = () => {
    onClose();
    onDelete();
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    if (onCategoryChanged) {
      onCategoryChanged(cat);
    }
    setIsMoveCategoryOpen(false);
    onClose();
  };

  return (
    <>
      <BottomSheet
        isOpen={isOpen && !isMoveCategoryOpen}
        onClose={onClose}
        title={contact.name}
        isDesktopDialog
      >
        <div className="space-y-1 pb-3">
          <button
            type="button"
            onClick={handleEdit}
            className="w-full flex items-center gap-3 p-3 rounded-card text-left text-sm font-medium text-text hover:bg-black/[0.03] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-fill flex items-center justify-center text-textSecondary">
              <IconPencil size={18} />
            </div>
            <span>Edit Contact</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMoveCategoryOpen(true)}
            className="w-full flex items-center justify-between p-3 rounded-card text-left text-sm font-medium text-text hover:bg-black/[0.03] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-fill flex items-center justify-center text-textSecondary">
                <IconFolderSymlink size={18} />
              </div>
              <div>
                <span>Move Category</span>
                <span className="block text-[11px] text-textSecondary font-normal">
                  Currently: {selectedCategory}
                </span>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleMerge}
            className="w-full flex items-center gap-3 p-3 rounded-card text-left text-sm font-medium text-text hover:bg-black/[0.03] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-fill flex items-center justify-center text-textSecondary">
              <IconGitMerge size={18} />
            </div>
            <span>Merge with Another Person</span>
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
              <span>Delete Contact</span>
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* MOVE CATEGORY SUB-SHEET */}
      <BottomSheet
        isOpen={isMoveCategoryOpen}
        onClose={() => setIsMoveCategoryOpen(false)}
        title="Move to Category"
        isDesktopDialog
      >
        <div className="space-y-1 pb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleSelectCategory(cat)}
              className="w-full flex items-center justify-between p-3 rounded-card text-left text-sm font-medium text-text hover:bg-black/[0.03] transition-colors"
            >
              <span>{cat}</span>
              {selectedCategory === cat && (
                <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center">
                  <IconCheck size={14} stroke={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
};

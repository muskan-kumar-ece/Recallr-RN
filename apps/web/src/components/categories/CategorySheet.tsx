'use client';

import React, { useState } from 'react';
import {
  IconCheck,
  IconBriefcase,
  IconBuilding,
  IconTools,
  IconUsers,
  IconHeart,
  IconDots,
} from '@tabler/icons-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';

export interface CategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  initialName?: string;
  initialColor?: string;
  initialIcon?: string;
  onSave: (data: { name: string; color: string; icon: string }) => void;
}

export const CategorySheet: React.FC<CategorySheetProps> = ({
  isOpen,
  onClose,
  isEdit = false,
  initialName = '',
  initialColor = '#E8641B',
  initialIcon = 'briefcase',
  onSave,
}) => {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [icon, setIcon] = useState(initialIcon);
  const [error, setError] = useState('');

  const colors = ['#E8641B', '#4F5BD5', '#1D9E75', '#D4537E', '#444441'];
  const iconOptions = [
    { key: 'briefcase', label: 'Briefcase', icon: <IconBriefcase size={20} /> },
    { key: 'building', label: 'Building', icon: <IconBuilding size={20} /> },
    { key: 'tools', label: 'Tools', icon: <IconTools size={20} /> },
    { key: 'users', label: 'Users', icon: <IconUsers size={20} /> },
    { key: 'heart', label: 'Heart', icon: <IconHeart size={20} /> },
  ];

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter a category name');
      return;
    }
    if (name.length > 30) {
      setError('Category name must be under 30 characters');
      return;
    }
    setError('');
    onSave({ name: name.trim(), color, icon });
    onClose();
  };

  const currentIconNode =
    iconOptions.find((i) => i.key === icon)?.icon || <IconBriefcase size={20} />;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Category' : 'New Category'}
      isDesktopDialog
    >
      <div className="space-y-4 pb-2">
        {/* Live Preview Card */}
        <div className="p-4 rounded-card bg-surface border border-border flex items-center gap-3.5 shadow-sm">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-colors"
            style={{ backgroundColor: color }}
          >
            {currentIconNode}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-text truncate">
              {name.trim() || 'Category Name'}
            </h4>
            <span className="text-xs text-textSecondary">0 people</span>
          </div>
        </div>

        {/* Category Name Input */}
        <div>
          <label className="block text-xs font-medium text-textSecondary mb-1">
            Category Name
          </label>
          <input
            type="text"
            value={name}
            maxLength={30}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Suppliers, Angel Investors, Colleagues"
            className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
          />
          {error && <p className="text-xs text-danger mt-1">{error}</p>}
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-xs font-medium text-textSecondary mb-2">
            Icon
          </label>
          <div className="flex items-center gap-2">
            {iconOptions.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setIcon(item.key)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  icon === item.key
                    ? 'bg-accentTint text-accent ring-2 ring-accent'
                    : 'bg-fill text-textSecondary hover:text-text'
                }`}
                title={item.label}
              >
                {item.icon}
              </button>
            ))}
            <button
              type="button"
              className="w-10 h-10 rounded-xl bg-fill text-textSecondary flex items-center justify-center hover:text-text"
              title="More icons"
            >
              <IconDots size={20} />
            </button>
          </div>
        </div>

        {/* Color Row */}
        <div>
          <label className="block text-xs font-medium text-textSecondary mb-2">
            Color
          </label>
          <div className="flex items-center gap-3">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all ${
                  color === c
                    ? 'ring-2 ring-offset-2 ring-accent scale-110 shadow-sm'
                    : 'hover:scale-105'
                }`}
              >
                {color === c && <IconCheck size={16} stroke={3} />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            style={{ width: '100%' }}
          >
            {isEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { IconX, IconTrash, IconCamera } from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  useContact,
  useCategories,
  useUpdateContact,
  useDeleteContact,
  uploadStorageFile,
} from '@recallr/api';
import { useRecallrAuth } from '@/providers/RecallrProvider';

export default function EditContactClient() {
  const router = useRouter();
  const params = useParams();
  const contactId = params?.id as string;
  const { user } = useRecallrAuth();

  const { data: dbContact, isLoading: isContactLoading } = useContact(contactId);
  const { data: dbCategories, isLoading: isCategoriesLoading } = useCategories();
  const { mutateAsync: updateContactAsync, isPending: isSaving } = useUpdateContact();
  const { mutateAsync: deleteContactAsync, isPending: isDeleting } = useDeleteContact();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [howMet, setHowMet] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dbContact) {
      const parts = (dbContact.name || '').split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setCompany(dbContact.company || '');
      setJobTitle(dbContact.role || '');
      setPhone(dbContact.phone || '');
      setEmail(dbContact.email || '');
      setHowMet(dbContact.met_where || '');
      setTags(dbContact.tags || []);
      setPhotoUrl(dbContact.photo_path || null);
      if (dbContact.category_ids && dbContact.category_ids.length > 0) {
        setSelectedCatId(dbContact.category_ids[0]);
      }
    }
  }, [dbContact]);

  const categories = dbCategories || [];

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    if (!fullName) {
      setToastMessage('Name cannot be empty');
      setToastVisible(true);
      return;
    }

    try {
      let finalPhotoUrl = photoUrl;
      if (photoFile && user?.id) {
        setToastMessage('Uploading contact photo...');
        setToastVisible(true);
        const path = `users/${user.id}/photos/${Date.now()}_${photoFile.name}`;
          finalPhotoUrl = await uploadStorageFile(path, photoFile);
      }

      await updateContactAsync({
        id: contactId,
        input: {
          name: fullName,
          role: jobTitle.trim() || null,
          company: company.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          photo_path: finalPhotoUrl,
          category_ids: selectedCatId ? [selectedCatId] : [],
          met_where: howMet.trim() || null,
          tags,
        },
      });

      setToastMessage('Contact saved successfully');
      setToastVisible(true);
      setTimeout(() => {
        router.push(`/people/${contactId}`);
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update contact';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteContactAsync({ id: contactId, soft: true });
      setToastMessage('Contact deleted');
      setToastVisible(true);
      setTimeout(() => {
        router.push('/people');
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete contact';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  if (isContactLoading) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
        <Skeleton className="h-10 w-48 rounded" />
        <Skeleton className="h-44 w-full rounded-card" />
        <Skeleton className="h-32 w-full rounded-card" />
      </div>
    );
  }

  if (!dbContact) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-8 text-center space-y-4">
        <EmptyState
          title="Contact Not Found"
          description="The contact you are looking for does not exist or has been removed."
          primaryAction={{
            label: 'Back to Contacts',
            onClick: () => router.push('/people'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6">
      <ScreenHeader
        title="Edit Contact"
        onBack={() => router.back()}
        rightAction={
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving || isDeleting}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        }
      />

      {/* Avatar & Photo Upload */}
      <div className="flex flex-col items-center justify-center my-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handlePhotoSelect}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative cursor-pointer group rounded-full overflow-hidden"
          title="Change photo"
        >
          {photoPreview || photoUrl ? (
            <img
              src={photoPreview || photoUrl || ''}
              alt="Preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-accent"
            />
          ) : (
            <Avatar name={`${firstName} ${lastName}`} size="xl" showBadge />
          )}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full text-white">
            <IconCamera size={22} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-accent font-medium mt-2 hover:underline cursor-pointer"
        >
          Change Photo
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Name & Title */}
        <Card className="bg-white border border-border p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-textSecondary mb-1">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-textSecondary mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-textSecondary mb-1">Job Title / Role</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-textSecondary mb-1">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>
        </Card>

        {/* Contact Info */}
        <Card className="bg-white border border-border p-4 space-y-3">
          <div>
            <label className="block text-xs text-textSecondary mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-textSecondary mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>
        </Card>

        {/* Category Selector */}
        <Card className="bg-white border border-border p-4">
          <label className="block text-xs text-textSecondary mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {isCategoriesLoading ? (
              <span className="text-xs text-textMuted">Loading categories...</span>
            ) : categories.length === 0 ? (
              <span className="text-xs text-textMuted">No categories available.</span>
            ) : (
              categories.map((cat) => (
                <Chip
                  key={cat.id}
                  variant={selectedCatId === cat.id ? 'selected' : 'default'}
                  onClick={() => setSelectedCatId(selectedCatId === cat.id ? '' : cat.id)}
                >
                  {cat.name}
                </Chip>
              ))
            )}
          </div>
        </Card>

        {/* How You Met */}
        <Card className="bg-white border border-border p-4">
          <label className="block text-xs text-textSecondary mb-1">How you met</label>
          <textarea
            value={howMet}
            onChange={(e) => setHowMet(e.target.value)}
            rows={3}
            className="w-full p-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent resize-none"
          />
        </Card>

        {/* Tags */}
        <Card className="bg-white border border-border p-4">
          <label className="block text-xs text-textSecondary mb-2">Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-accentTint text-accentDark rounded-full text-xs font-medium"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-accent"
                >
                  <IconX size={12} />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type tag and press Enter"
            className="w-full h-9 px-3 bg-bg rounded-input border border-border text-xs text-text focus:outline-none focus:border-accent"
          />
        </Card>

        {/* Danger Zone: Delete Contact */}
        <div className="pt-2">
          <Button
            variant="danger"
            size="md"
            icon={<IconTrash size={16} />}
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full"
          >
            {isDeleting ? 'Deleting...' : 'Delete Contact'}
          </Button>
        </div>
      </div>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        actionText="Close"
        onAction={() => setToastVisible(false)}
      />
    </div>
  );
}

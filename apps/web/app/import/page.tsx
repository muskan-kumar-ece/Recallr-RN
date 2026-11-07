'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import {
  IconUpload,
  IconCheck,
  IconFileSpreadsheet,
  IconAlertCircle,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useImportContactsBatch } from '@recallr/api';
import { ContactInput } from '@recallr/core';

interface ParsedContactItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  role: string;
}

export default function ImportContactsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedContacts, setParsedContacts] = useState<ParsedContactItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const { mutateAsync: importBatch, isPending: isImporting } = useImportContactsBatch();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setFileName(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setErrorMessage('The CSV file appears to be empty.');
          setParsedContacts([]);
          setSelectedIds([]);
          return;
        }

        const items: ParsedContactItem[] = [];

        results.data.forEach((row, index) => {
          // Normalize various possible CSV header spellings
          const firstName = row['First Name'] || row['FirstName'] || row['Given Name'] || '';
          const lastName = row['Last Name'] || row['LastName'] || row['Family Name'] || '';
          const rawName =
            row['Name'] ||
            row['Full Name'] ||
            row['name'] ||
            (firstName || lastName ? `${firstName} ${lastName}`.trim() : '');

          const phone =
            row['Phone'] ||
            row['Phone 1 - Value'] ||
            row['Mobile'] ||
            row['Mobile Phone'] ||
            row['phone'] ||
            row['mobile'] ||
            '';

          const email =
            row['Email'] ||
            row['Email 1 - Value'] ||
            row['E-mail'] ||
            row['email'] ||
            '';

          const company =
            row['Company'] ||
            row['Organization 1 - Name'] ||
            row['Company Name'] ||
            row['company'] ||
            '';

          const role =
            row['Job Title'] ||
            row['Organization 1 - Title'] ||
            row['Role'] ||
            row['Title'] ||
            row['role'] ||
            '';

          const name = rawName.trim() || email.split('@')[0] || phone || `Contact #${index + 1}`;

          // Only keep contacts with at least some identifier
          if (rawName || phone || email || company) {
            items.push({
              id: `parsed-${index}-${Date.now()}`,
              name,
              phone: phone.trim(),
              email: email.trim(),
              company: company.trim(),
              role: role.trim(),
            });
          }
        });

        if (items.length === 0) {
          setErrorMessage('Could not find recognizable contact columns (Name, Phone, Email, Company).');
          setParsedContacts([]);
          setSelectedIds([]);
          return;
        }

        setParsedContacts(items);
        setSelectedIds(items.map((item) => item.id));
      },
      error: (error) => {
        setErrorMessage(`Failed to parse CSV: ${error.message}`);
        setParsedContacts([]);
        setSelectedIds([]);
      },
    });
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === parsedContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(parsedContacts.map((c) => c.id));
    }
  };

  const handleImport = async () => {
    const chosen = parsedContacts.filter((c) => selectedIds.includes(c.id));
    if (chosen.length === 0) return;

    try {
      const inputs: ContactInput[] = chosen.map((c) => ({
        name: c.name,
        phone: c.phone || null,
        email: c.email || null,
        company: c.company || null,
        role: c.role || null,
        source: 'import',
        tags: ['imported'],
        links: [],
        category_ids: [],
      }));

      await importBatch(inputs);

      setToastMessage(`Successfully imported ${chosen.length} contacts into your network!`);
      setToastVisible(true);
      setTimeout(() => {
        router.push('/people');
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import contacts. Please try again.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
      <ScreenHeader
        title="Import Contacts"
        subtitle="Bring your network into Recallr"
        onBack={() => router.push('/settings')}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv, text/csv, text/plain"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* File Upload Dropzone */}
      <Card
        onClick={() => fileInputRef.current?.click()}
        className="p-6 bg-white border-2 border-dashed border-border hover:border-accent cursor-pointer transition-colors flex flex-col items-center justify-center text-center"
      >
        <div className="w-12 h-12 rounded-[14px] bg-accentTint flex items-center justify-center text-accent mb-2.5">
          {fileName ? <IconFileSpreadsheet size={24} /> : <IconUpload size={24} />}
        </div>
        <h3 className="text-sm font-medium text-text">
          {fileName ? fileName : 'Upload CSV (.csv)'}
        </h3>
        <p className="text-xs text-textSecondary max-w-xs mt-1">
          {fileName
            ? `Found ${parsedContacts.length} contacts ready to import. Review and select below.`
            : 'Export your contacts from Google, Apple, or Outlook and click here to select the CSV.'}
        </p>
      </Card>

      {errorMessage && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-card flex items-center gap-2 text-xs text-danger">
          <IconAlertCircle size={16} className="flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Parsed Contacts Selection List */}
      {parsedContacts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-medium text-textSecondary uppercase tracking-wider">
              Contacts Found ({parsedContacts.length})
            </span>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs text-accent font-medium hover:underline"
            >
              {selectedIds.length === parsedContacts.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <Card className="bg-white border border-border divide-y divide-divider overflow-hidden max-h-96 overflow-y-auto">
            {parsedContacts.map((contact) => {
              const isSelected = selectedIds.includes(contact.id);
              return (
                <div
                  key={contact.id}
                  onClick={() => toggleSelect(contact.id)}
                  className="p-3.5 flex items-center gap-3 cursor-pointer hover:bg-black/[0.015] transition-colors"
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${
                      isSelected
                        ? 'bg-accent border-accent text-white'
                        : 'border-borderStrong bg-white'
                    }`}
                  >
                    {isSelected && <IconCheck size={14} stroke={3} />}
                  </div>

                  <Avatar name={contact.name} size="sm" />

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-text truncate">
                      {contact.name}
                    </div>
                    <div className="text-[11px] text-textSecondary truncate">
                      {[contact.role, contact.company, contact.phone, contact.email]
                        .filter(Boolean)
                        .join(' • ')}
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {parsedContacts.length > 0 && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            disabled={selectedIds.length === 0 || isImporting}
            onClick={handleImport}
            style={{ width: '100%' }}
          >
            {isImporting
              ? 'Importing...'
              : `Import ${selectedIds.length} Contact${selectedIds.length === 1 ? '' : 's'}`}
          </Button>
        </div>
      )}

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        actionText="Close"
        onAction={() => setToastVisible(false)}
      />
    </div>
  );
}

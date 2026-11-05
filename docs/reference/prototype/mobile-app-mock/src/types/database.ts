export interface Profile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  headline?: string;
  company?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon?: string;
  color?: string;
  count?: number;
  recent_activity?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  headline?: string;
  company?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  met_at?: string;
  met_date?: string;
  bio?: string;
  avatar_url?: string;
  category_ids?: string[];
  category_names?: string[];
  last_contacted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactCategory {
  contact_id: string;
  category_id: string;
}

export interface Note {
  id: string;
  user_id: string;
  contact_id?: string;
  contact_name?: string;
  title?: string;
  content: string;
  remind_at?: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  done: boolean;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  contact_id?: string;
  title: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  created_at: string;
}

export interface DigitalCard {
  id: string;
  user_id: string;
  slug: string;
  fields: {
    name: string;
    title?: string;
    company?: string;
    phone?: string;
    email?: string;
    website?: string;
    linkedin?: string;
    twitter?: string;
    notes?: string;
  };
  visibility: 'public' | 'private' | 'unlisted';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

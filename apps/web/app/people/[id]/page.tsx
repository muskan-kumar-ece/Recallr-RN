import ContactDetailClient from './ContactDetailClient';

export function generateStaticParams() {
  return [{ id: 'item' }];
}

export default function ContactDetailPage() {
  return <ContactDetailClient />;
}

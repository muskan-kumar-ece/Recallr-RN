import EditContactClient from './EditContactClient';

export function generateStaticParams() {
  return [{ id: 'item' }];
}

export default function EditContactPage() {
  return <EditContactClient />;
}

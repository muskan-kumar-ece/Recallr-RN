import EditNoteClient from './EditNoteClient';

export function generateStaticParams() {
  return [{ id: 'item' }];
}

export default function EditNotePage() {
  return <EditNoteClient />;
}

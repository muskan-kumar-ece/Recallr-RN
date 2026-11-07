import PublicCardClient from './PublicCardClient';

export function generateStaticParams() {
  return [{ slug: 'item' }];
}

export default function PublicCardPage() {
  return <PublicCardClient />;
}

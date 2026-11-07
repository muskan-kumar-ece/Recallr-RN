import CategoryDetailClient from './CategoryDetailClient';

export function generateStaticParams() {
  return [{ id: 'item' }];
}

export default function CategoryDetailPage() {
  return <CategoryDetailClient />;
}

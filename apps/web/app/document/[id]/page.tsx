import DocumentViewerClient from './DocumentViewerClient';

export function generateStaticParams() {
  return [{ id: 'item' }];
}

export default function DocumentViewerPage() {
  return <DocumentViewerClient />;
}

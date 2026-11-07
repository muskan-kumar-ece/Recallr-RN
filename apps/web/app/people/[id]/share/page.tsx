import ShareContactClient from './ShareContactClient';

export function generateStaticParams() {
  return [{ id: 'item' }];
}

export default function ShareContactRoute() {
  return <ShareContactClient />;
}

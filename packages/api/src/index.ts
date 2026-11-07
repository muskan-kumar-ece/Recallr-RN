export * from './client';
export * from './auth';
export * from './firebase';
export * from './queries';
export * from './hooks';

export { QueryClient, QueryClientProvider } from '@tanstack/react-query';
export type { User, Session, UserMetadata } from './auth';

export const API_VERSION = '0.1.0';

'use client';

import { AuthProvider } from '@/context/AuthContext';
import { DjAuthProvider } from '@/context/DjAuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DjAuthProvider>{children}</DjAuthProvider>
    </AuthProvider>
  );
}

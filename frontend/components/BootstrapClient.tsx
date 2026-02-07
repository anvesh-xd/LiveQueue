'use client';

import { useEffect } from 'react';

export default function BootstrapClient() {
  useEffect(() => {
    // Dynamically import Bootstrap JS only on the client side
    import('bootstrap');
  }, []);

  return null;
}

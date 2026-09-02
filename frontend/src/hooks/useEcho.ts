import { useEffect } from 'react';
import { useAppSelector } from '@/store';

// WebSocket disabled - Reverb not configured on Railway
// Real-time notifications require a separate Reverb deployment

export function useEcho() {
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    // No-op: WebSocket disabled
    // To enable: deploy Laravel Reverb and configure VITE_ env vars
  }, [user]);
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tracks when the user last opened their notifications, persisted to
// localStorage. The unread dot compares the newest notification's time against
// this, so "unread" is a client-side notion (per device). This keeps the
// feature backend-free for now; if notifications go server-authoritative later,
// this is the piece that would move to a read flag.
type NotificationSeenState = {
  lastSeenAt: number;
  markSeen: () => void;
};

export const useNotificationSeenStore = create<NotificationSeenState>()(
  persist(
    (set) => ({
      lastSeenAt: 0,
      markSeen: () => set({ lastSeenAt: Date.now() }),
    }),
    { name: 'relates-notifications-last-seen' },
  ),
);

// Event contract shared by the producer (controllers writing to the outbox)
// and the consumer (which turns events into notifications). Keeping the type
// names and payload shapes in one place means both sides can't drift.

export const LIKE_CREATED = 'LIKE_CREATED';
export const FOLLOW_CREATED = 'FOLLOW_CREATED';

export type EventType = typeof LIKE_CREATED | typeof FOLLOW_CREATED;

// Someone liked recipient's post.
export interface LikeCreatedPayload {
  actorId: number;
  recipientId: number;
  postId: number;
}

// Someone followed recipient.
export interface FollowCreatedPayload {
  actorId: number;
  recipientId: number;
}

export type EventPayload = LikeCreatedPayload | FollowCreatedPayload;

// Event contract shared by the producer (controllers writing to the outbox)
// and the consumer (which turns events into notifications). Keeping the type
// names and payload shapes in one place means both sides can't drift.

export const LIKE_CREATED = 'LIKE_CREATED';
export const FOLLOW_CREATED = 'FOLLOW_CREATED';
export const POST_CREATED = 'POST_CREATED';

export type EventType =
  | typeof LIKE_CREATED
  | typeof FOLLOW_CREATED
  | typeof POST_CREATED;

// Someone liked recipient's post.
export type LikeCreatedPayload = {
  actorId: number;
  recipientId: number;
  postId: number;
};

// Someone followed recipient.
export type FollowCreatedPayload = {
  actorId: number;
  recipientId: number;
};

// A root post was created; drives feed fan-out.
export type PostCreatedPayload = {
  postId: number;
  authorId: number;
};

export type EventPayload =
  | LikeCreatedPayload
  | FollowCreatedPayload
  | PostCreatedPayload;

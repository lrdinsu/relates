import { Consumer } from 'kafkajs';

import { prisma } from '../db/index.js';
import { kafka } from '../events/kafka.js';
import { indexPost, removePost } from './postIndex.js';

// Debezium publishes one topic per table. With topic.prefix=relates the Post
// table's changes land on `relates.public.Post`.
const CDC_POST_TOPIC = process.env.CDC_POST_TOPIC ?? 'relates.public.Post';

export const indexerConsumer: Consumer = kafka.consumer({
  groupId: 'es-indexer',
});

// Apply one Debezium change event to the index. Rather than trust the change
// payload's serialized fields (timestamps, types vary by connector config), we
// take the post id from the envelope and re-read the authoritative row from
// Postgres, then index it. CDC tells us *what* changed; Postgres remains the
// source of truth for the contents. Exported so tests can drive it directly.
export async function handleChangeEvent(raw: string): Promise<void> {
  const message = JSON.parse(raw) as {
    op?: string;
    payload?: { op?: string; after?: { id?: number }; before?: { id?: number } };
    after?: { id?: number };
    before?: { id?: number };
  };
  // Debezium wraps the change in `payload`; tolerate an already-unwrapped shape.
  const payload = message.payload ?? message;
  const op = payload.op;

  const idValue = payload.after?.id ?? payload.before?.id;
  if (idValue == null) return;
  const postId = Number(idValue);

  if (op === 'd') {
    await removePost(postId);
    return;
  }

  // create / update / snapshot: index the current row (or drop it if gone or
  // soft-deleted, which indexPost handles).
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      text: true,
      postedById: true,
      createdAt: true,
      isDeleted: true,
    },
  });
  if (!post) {
    await removePost(postId);
    return;
  }
  await indexPost(post);
}

let running = false;

export async function startSearchIndexer(): Promise<void> {
  if (running) return;
  await indexerConsumer.connect();
  await indexerConsumer.subscribe({ topic: CDC_POST_TOPIC, fromBeginning: true });
  await indexerConsumer.run({
    eachMessage: async ({ message }) => {
      // Debezium emits a null-value tombstone after a delete; the delete event
      // itself already removed the doc, so skip tombstones.
      if (!message.value) return;
      await handleChangeEvent(message.value.toString());
    },
  });
  running = true;
  console.log('Search indexer started (CDC -> Elasticsearch)');
}

export async function stopSearchIndexer(): Promise<void> {
  if (running) {
    await indexerConsumer.disconnect();
    running = false;
  }
}

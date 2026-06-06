import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '../src/app';
import { createPost, secondUser, signup } from './helpers';
import { resetDatabase } from './setup/resetDb';

async function setupTwoUsers() {
  const alice = (await signup()).body;
  const bob = (await signup(secondUser)).body;
  return { alice, bob };
}

function bearer(token: string) {
  return `Bearer ${token}`;
}

describe('post interactions and authorization', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('likes then unlikes a post, updating the count and isLiked', async () => {
    const { accessToken } = (await signup()).body;
    const postId = (await createPost(accessToken, { text: 'hello' })).body.post
      .id;

    await request(app)
      .put(`/api/v1/posts/${postId}/like`)
      .set('Authorization', bearer(accessToken))
      .expect(204);

    let res = await request(app)
      .get(`/api/v1/posts/${postId}`)
      .set('Authorization', bearer(accessToken));
    expect(res.body.post.likesCount).toBe(1);
    expect(res.body.post.isLiked).toBe(true);

    await request(app)
      .put(`/api/v1/posts/${postId}/like`)
      .set('Authorization', bearer(accessToken))
      .expect(204);

    res = await request(app)
      .get(`/api/v1/posts/${postId}`)
      .set('Authorization', bearer(accessToken));
    expect(res.body.post.likesCount).toBe(0);
    expect(res.body.post.isLiked).toBe(false);
  });

  it('counts likes from two different users', async () => {
    const { alice, bob } = await setupTwoUsers();
    const postId = (await createPost(alice.accessToken, { text: 'hi' })).body
      .post.id;

    await request(app)
      .put(`/api/v1/posts/${postId}/like`)
      .set('Authorization', bearer(alice.accessToken))
      .expect(204);
    await request(app)
      .put(`/api/v1/posts/${postId}/like`)
      .set('Authorization', bearer(bob.accessToken))
      .expect(204);

    const res = await request(app).get(`/api/v1/posts/${postId}`);
    expect(res.body.post.likesCount).toBe(2);
  });

  it('reflects the viewer repost state via isReposted', async () => {
    const { alice, bob } = await setupTwoUsers();
    const postId = (await createPost(alice.accessToken, { text: 'hi' })).body
      .post.id;

    await request(app)
      .put(`/api/v1/posts/${postId}/repost`)
      .set('Authorization', bearer(bob.accessToken))
      .expect(204);

    // The reposter sees isReposted true; the author (who didn't repost) sees false.
    let res = await request(app)
      .get(`/api/v1/posts/${postId}`)
      .set('Authorization', bearer(bob.accessToken));
    expect(res.body.post.isReposted).toBe(true);
    expect(res.body.post.repostsCount).toBe(1);

    res = await request(app)
      .get(`/api/v1/posts/${postId}`)
      .set('Authorization', bearer(alice.accessToken));
    expect(res.body.post.isReposted).toBe(false);
    expect(res.body.post.repostsCount).toBe(1);

    // Unrepost flips it back.
    await request(app)
      .put(`/api/v1/posts/${postId}/repost`)
      .set('Authorization', bearer(bob.accessToken))
      .expect(204);
    res = await request(app)
      .get(`/api/v1/posts/${postId}`)
      .set('Authorization', bearer(bob.accessToken));
    expect(res.body.post.isReposted).toBe(false);
    expect(res.body.post.repostsCount).toBe(0);
  });

  it("rejects editing another user's post", async () => {
    const { alice, bob } = await setupTwoUsers();
    const postId = (await createPost(alice.accessToken, { text: 'mine' })).body
      .post.id;

    const res = await request(app)
      .put(`/api/v1/posts/${postId}`)
      .set('Authorization', bearer(bob.accessToken))
      .send({ text: 'hacked' });

    expect(res.status).toBe(403);
  });

  it("rejects deleting another user's post", async () => {
    const { alice, bob } = await setupTwoUsers();
    const postId = (await createPost(alice.accessToken, { text: 'mine' })).body
      .post.id;

    const res = await request(app)
      .delete(`/api/v1/posts/${postId}`)
      .set('Authorization', bearer(bob.accessToken));

    expect(res.status).toBe(403);
  });

  it('lets the owner edit their own post', async () => {
    const { accessToken } = (await signup()).body;
    const postId = (await createPost(accessToken, { text: 'original' })).body
      .post.id;

    await request(app)
      .put(`/api/v1/posts/${postId}`)
      .set('Authorization', bearer(accessToken))
      .send({ text: 'edited' })
      .expect(204);

    const res = await request(app).get(`/api/v1/posts/${postId}`);
    expect(res.body.post.text).toBe('edited');
  });

  it('soft-deletes the owner post so it is no longer fetchable', async () => {
    const { accessToken } = (await signup()).body;
    const postId = (await createPost(accessToken, { text: 'bye' })).body.post.id;

    await request(app)
      .delete(`/api/v1/posts/${postId}`)
      .set('Authorization', bearer(accessToken))
      .expect(204);

    const res = await request(app).get(`/api/v1/posts/${postId}`);
    expect(res.status).toBe(404);
  });

  it('shows a followed user posts in the following feed', async () => {
    const { alice, bob } = await setupTwoUsers();
    await createPost(bob.accessToken, { text: 'from bob' });

    await request(app)
      .put(`/api/v1/users/follow/${bob.userId}`)
      .set('Authorization', bearer(alice.accessToken))
      .expect(204);

    const res = await request(app)
      .get('/api/v1/posts/following')
      .set('Authorization', bearer(alice.accessToken));

    expect(res.status).toBe(200);
    const texts = res.body.posts.map((p: { text: string }) => p.text);
    expect(texts).toContain('from bob');
  });
});

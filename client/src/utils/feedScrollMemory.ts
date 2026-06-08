const feedPaths = new Set(['/', '/for-you', '/following']);

type FeedScrollSnapshot = {
  postId: number;
  scrollY: number;
  anchorTop: number;
};

const snapshots = new Map<string, FeedScrollSnapshot>();

export function getFeedScrollKey(pathname: string, endpoint: string) {
  if (!feedPaths.has(pathname)) return null;
  return endpoint;
}

export function saveFeedScrollSnapshot(
  key: string | null,
  postId: number,
  anchorTop: number,
) {
  if (!key) return;

  snapshots.set(key, {
    postId,
    scrollY: window.scrollY,
    anchorTop,
  });
}

export function restoreFeedScrollSnapshot(key: string | null) {
  if (!key) return false;

  const snapshot = snapshots.get(key);
  if (!snapshot) return false;

  const postElement = document.querySelector<HTMLElement>(
    `[data-post-id="${snapshot.postId}"]`,
  );

  if (!postElement) {
    window.scrollTo({ top: snapshot.scrollY, behavior: 'auto' });
    return true;
  }

  const postTop = postElement.getBoundingClientRect().top;
  window.scrollTo({
    top: window.scrollY + postTop - snapshot.anchorTop,
    behavior: 'auto',
  });

  return true;
}

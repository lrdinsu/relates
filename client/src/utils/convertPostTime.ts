export function convertPostTime(postTime: Date) {
  const now = new Date();
  const diff = now.getTime() - postTime.getTime();

  if (diff < 1000) {
    return 'just now';
  }

  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d`;
  }

  // format as month/day/year
  return postTime.toLocaleDateString();
}

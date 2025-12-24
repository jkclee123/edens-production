/**
 * Formats a timestamp into a relative time string (e.g., "5m ago", "2h ago", "3d ago")
 * or a short date if older than 7 days.
 */
export const formatRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: days > 365 ? "numeric" : undefined,
    });
  }
  if (days > 0) return `${days} 日前`;
  if (hours > 0) return `${hours} 小時前`;
  if (minutes > 0) return `${minutes} 分鐘前`;
  return "剛剛";
};


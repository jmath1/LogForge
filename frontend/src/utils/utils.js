export const formatAge = (ageInSeconds) => {
    const absAge = Math.abs(ageInSeconds); // Handle negative ages if any
    if (absAge < 60) {
      return `${Math.floor(absAge)}s ago`;
    } else if (absAge < 3600) { // Less than an hour
      const minutes = Math.floor(absAge / 60);
      return `${minutes}m ago`;
    } else if (absAge < 86400) { // Less than a day
      const hours = Math.floor(absAge / 3600);
      return `${hours}h ago`;
    } else if (absAge < 604800) { // Less than a week
      const days = Math.floor(absAge / 86400);
      return `${days}d ago`;
    } else if (absAge < 2592000) { // Less than a month (approx 30 days)
      const weeks = Math.floor(absAge / 604800);
      return `${weeks}w ago`;
    } else {
      const months = Math.floor(absAge / 2592000);
      return `${months}mo ago`;
    }
  };
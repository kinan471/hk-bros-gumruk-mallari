export const WISHLIST_STORAGE_KEY = 'hk_bros_wishlist';

let cachedStorageValue: string | null | undefined;
let cachedFavoriteIds: string[] = [];
const subscribers = new Set<() => void>();

export function getFavoriteIds(): string[] {
  if (typeof window === 'undefined') return [];

  let storageValue: string | null;
  try {
    storageValue = localStorage.getItem(WISHLIST_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to read favorites:', error);
    return cachedFavoriteIds;
  }

  if (storageValue === cachedStorageValue) return cachedFavoriteIds;
  cachedStorageValue = storageValue;

  if (!storageValue) {
    cachedFavoriteIds = [];
    return cachedFavoriteIds;
  }

  try {
    const parsed: unknown = JSON.parse(storageValue);
    if (!Array.isArray(parsed)) throw new TypeError('Stored wishlist must be an array.');
    cachedFavoriteIds = parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
  } catch (error) {
    console.error('Failed to parse favorites:', error);
    cachedFavoriteIds = [];
  }

  return cachedFavoriteIds;
}

export function saveFavoriteIds(ids: string[]) {
  const value = JSON.stringify([...new Set(ids)]);
  cachedFavoriteIds = [...new Set(ids)];

  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, value);
    cachedStorageValue = value;
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }

  subscribers.forEach((subscriber) => subscriber());
}

export function subscribeToFavorites(onStoreChange: () => void) {
  subscribers.add(onStoreChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === WISHLIST_STORAGE_KEY) {
      cachedStorageValue = undefined;
      onStoreChange();
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    subscribers.delete(onStoreChange);
    window.removeEventListener('storage', onStorage);
  };
}

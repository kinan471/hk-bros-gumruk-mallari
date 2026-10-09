'use client';
import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  useCallback,
  type ReactNode,
} from 'react';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  regularPrice?: number;
  image: string;
  quantity: number;
  condition?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  totalSavings: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CART_STORAGE_KEY = 'hk_bros_cart';
const EMPTY_CART: CartItem[] = [];
let cachedStorageValue: string | null | undefined;
let cachedItems: CartItem[] = EMPTY_CART;
const cartSubscribers = new Set<() => void>();

const CartContext = createContext<CartContextType | undefined>(undefined);

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.slug === 'string' &&
    typeof item.price === 'number' &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    (item.regularPrice === undefined ||
      (typeof item.regularPrice === 'number' && Number.isFinite(item.regularPrice))) &&
    typeof item.image === 'string' &&
    Number.isInteger(item.quantity) &&
    (item.quantity as number) > 0 &&
    (item.condition === undefined || typeof item.condition === 'string')
  );
}

function getCartSnapshot(): CartItem[] {
  if (typeof window === 'undefined') return EMPTY_CART;

  let storageValue: string | null;
  try {
    storageValue = localStorage.getItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to load cart:', error);
    return cachedItems;
  }

  if (storageValue === cachedStorageValue) return cachedItems;
  cachedStorageValue = storageValue;

  if (!storageValue) {
    cachedItems = EMPTY_CART;
    return cachedItems;
  }

  try {
    const parsed: unknown = JSON.parse(storageValue);
    if (!Array.isArray(parsed)) throw new TypeError('Stored cart must be an array.');
    const validItems = parsed.filter(isCartItem);
    if (validItems.length !== parsed.length) {
      console.error('Cart storage contained invalid items; invalid entries were ignored.');
    }
    cachedItems = validItems;
  } catch (error) {
    console.error('Failed to parse cart:', error);
    cachedItems = EMPTY_CART;
  }

  return cachedItems;
}

function subscribeToCart(onStoreChange: () => void) {
  cartSubscribers.add(onStoreChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) {
      cachedStorageValue = undefined;
      onStoreChange();
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    cartSubscribers.delete(onStoreChange);
    window.removeEventListener('storage', onStorage);
  };
}

function updateCartItems(updater: (items: CartItem[]) => CartItem[]) {
  const nextItems = updater(getCartSnapshot());
  const nextStorageValue = JSON.stringify(nextItems);
  cachedItems = nextItems;

  try {
    localStorage.setItem(CART_STORAGE_KEY, nextStorageValue);
    cachedStorageValue = nextStorageValue;
  } catch (error) {
    console.error('Failed to save cart:', error);
  }

  cartSubscribers.forEach((subscriber) => subscriber());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    () => EMPTY_CART
  );
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
    updateCartItems(prev => {
      const existing = prev.find(item => item.id === newItem.id);
      if (existing) {
        return prev.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    updateCartItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      updateCartItems(prev => prev.filter(item => item.id !== id));
      return;
    }
    updateCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    updateCartItems(() => EMPTY_CART);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalSavings = items.reduce((sum, item) => {
    if (item.regularPrice && item.regularPrice > item.price) {
      return sum + (item.regularPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        totalSavings,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
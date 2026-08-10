import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { cartService } from '../services/cart.service';
import { useAuth } from './AuthContext';
import type { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  cartTotal: number;
  cartItemCount: number;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadRequestId = useRef(0);
  const { user, userType, isAuthenticated, isInitialized } = useAuth();

  const loadCart = useCallback(async () => {
    const requestId = ++loadRequestId.current;
    setIsLoading(true);
    try {
      if (isAuthenticated && userType === 'customer' && user) {
        const dbCart = await cartService.getDatabaseCart(user.id);
        if (requestId !== loadRequestId.current) return;
        setCart(dbCart);
      } else {
        const localCart = cartService.getLocalCart();
        if (requestId !== loadRequestId.current) return;
        setCart(localCart);
      }
      setError(null);
    } catch (loadError) {
      if (requestId !== loadRequestId.current) return;
      console.error('Error loading cart:', loadError);
      setCart([]);
      setError('Failed to load cart. Please try again.');
    } finally {
      if (requestId === loadRequestId.current) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, userType, user]);

  // Wait for auth to settle before choosing between the DB and local cart,
  // so a logged-in customer doesn't briefly see (and race with) a guest cart.
  useEffect(() => {
    if (!isInitialized) return;
    loadCart();
  }, [isInitialized, loadCart]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    setIsSyncing(true);
    try {
      if (isAuthenticated && userType === 'customer' && user) {
        const updatedCart = await cartService.addToDatabaseCart(user.id, product.id, quantity);
        setCart(updatedCart);
      } else {
        const updatedCart = cartService.addToCart(product, quantity);
        setCart(updatedCart);
      }
      setError(null);
    } catch (addError) {
      setError('Failed to add item to cart. Please try again.');
      throw addError;
    } finally {
      setIsSyncing(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    setIsSyncing(true);
    try {
      if (isAuthenticated && userType === 'customer' && user) {
        const updatedCart = await cartService.removeFromDatabaseCart(user.id, productId);
        setCart(updatedCart);
      } else {
        const updatedCart = cartService.removeFromCart(productId);
        setCart(updatedCart);
      }
      setError(null);
    } catch (removeError) {
      setError('Failed to remove item from cart. Please try again.');
      throw removeError;
    } finally {
      setIsSyncing(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    setIsSyncing(true);
    try {
      if (isAuthenticated && userType === 'customer' && user) {
        const updatedCart = await cartService.updateDatabaseQuantity(user.id, productId, quantity);
        setCart(updatedCart);
      } else {
        const updatedCart = cartService.updateQuantity(productId, quantity);
        setCart(updatedCart);
      }
      setError(null);
    } catch (updateError) {
      setError('Failed to update quantity. Please try again.');
      throw updateError;
    } finally {
      setIsSyncing(false);
    }
  };

  const clearCart = async () => {
    setIsSyncing(true);
    try {
      if (isAuthenticated && userType === 'customer' && user) {
        await cartService.clearDatabaseCart(user.id);
      } else {
        cartService.clearCart();
      }
      setCart([]);
      setError(null);
    } catch (clearError) {
      setError('Failed to clear cart. Please try again.');
      throw clearError;
    } finally {
      setIsSyncing(false);
    }
  };

  const cartTotal = cartService.getCartTotal(cart);
  const cartItemCount = cartService.getCartItemCount(cart);

  const value: CartContextType = {
    cart,
    cartTotal,
    cartItemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isLoading,
    isSyncing,
    error,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/product';

type CartItem = {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  quantity: number;
  category?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'evolaine_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Récupérer le panier depuis le localStorage au chargement
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Sauvegarder le panier dans le localStorage à chaque modification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevCart, { 
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        quantity: 1 
      }];
    });
  };

  const removeFromCart = (productId: number) => {
    try {
      console.log('Tentative de suppression du produit ID:', productId);
      setCart(prevCart => {
        const newCart = prevCart.filter(item => item.id !== productId);
        console.log('Nouveau panier après suppression:', newCart);
        return newCart;
      });
    } catch (error) {
      console.error('Erreur dans removeFromCart:', error);
      // Ne pas propager l'erreur pour éviter les crashs
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = (items: CartItem[]) => {
    return items.reduce((total, item) => {
      // Convertir le prix en nombre en supprimant les espaces et en remplaçant les virgules par des points
      const priceStr = item.price.toString().replace(/\s+/g, '').replace(',', '.');
      const price = parseFloat(priceStr) || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const cartTotal = calculateTotal(cart);
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export type { CartItem };

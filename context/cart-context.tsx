// context/cart-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  // 🟢 REFACTOR: Sekarang menerima kuantitas eksplisit untuk mencegah hardcode +1
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  getCartCount: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('sahabat_sport_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('sahabat_sport_cart', JSON.stringify(newCart));
  };

  // 🟢 REFACTOR LOGIC: Akumulasikan berdasarkan nilai kuantitas riil dari input user
  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity: number) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      saveCart(
        cart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } // 🌟 Ditambahkan sesuai jumlah input, bukan statis +1
            : item
        )
      );
    } else {
      saveCart([...cart, { ...product, quantity: quantity }]); // 🌟 Inisialisasi awal dengan kuantitas yang benar
    }
  };

  const decreaseQuantity = (id: string) => {
    const targetItem = cart.find(item => item.id === id);
    if (!targetItem) return;

    if (targetItem.quantity <= 1) {
      removeFromCart(id);
    } else {
      saveCart(cart.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item));
    }
  };

  const removeFromCart = (id: string) => {
    saveCart(cart.filter(item => item.id !== id));
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => saveCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, decreaseQuantity, removeFromCart, getCartCount, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart harus digunakan di dalam CartProvider');
  return context;
}
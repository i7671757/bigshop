'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { useUser } from '@clerk/nextjs';

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  className?: string;
  disabled?: boolean;
}

export function AddToCartButton({ 
  productId, 
  quantity = 1, 
  className = '',
  disabled = false 
}: AddToCartButtonProps) {
  const { user } = useUser();
  const { addItem, isAdding, isInCart, getItemQuantity } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);

  const currentQuantity = getItemQuantity(productId);
  const alreadyInCart = isInCart(productId);

  const handleAddToCart = async () => {
    if (!user) {
      // TODO: Показать модал авторизации или редирект на /sign-in
      window.location.href = '/sign-in';
      return;
    }

    try {
      await addItem({ productId, quantity });
      
      // Показываем анимацию успеха
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // TODO: Показать toast с ошибкой
    }
  };

  if (!user) {
    return (
      <button
        onClick={handleAddToCart}
        className={`px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium ${className}`}
      >
        Войти для покупки
      </button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative overflow-hidden ${
        showSuccess 
          ? 'bg-green-500 text-white' 
          : alreadyInCart
          ? 'bg-orange-500 text-white hover:bg-orange-600'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Добавляем...</span>
          </motion.div>
        ) : showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Добавлено!</span>
          </motion.div>
        ) : (
          <motion.span
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {alreadyInCart ? `В корзине (${currentQuantity})` : 'В корзину'}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
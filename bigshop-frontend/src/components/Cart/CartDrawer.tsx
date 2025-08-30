'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { CartItem } from './CartItem';
import { useUser } from '@clerk/nextjs';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { user } = useUser();
  const { 
    items, 
    totalItems, 
    totalAmount, 
    isEmpty, 
    isLoading,
    clearCart,
    isClearing 
  } = useCart();

  const handleCheckout = () => {
    // TODO: Implement checkout functionality
    console.log('Proceeding to checkout...');
  };

  const handleClearCart = () => {
    if (window.confirm('Вы уверены, что хотите очистить корзину?')) {
      clearCart();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Корзина</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              
              {user && (
                <p className="text-sm text-gray-600">
                  {user.firstName} {user.lastName}
                </p>
              )}
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">
                  {totalItems} товар{totalItems === 1 ? '' : totalItems < 5 ? 'а' : 'ов'}
                </span>
                
                {!isEmpty && (
                  <button
                    onClick={handleClearCart}
                    disabled={isClearing}
                    className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {isClearing ? 'Очищаем...' : 'Очистить корзину'}
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : isEmpty ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Корзина пуста
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Добавьте товары из каталога
                    </p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Продолжить покупки
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with total and checkout */}
            {!isEmpty && !isLoading && (
              <div className="border-t bg-gray-50 p-6">
                <div className="space-y-4">
                  {/* Total */}
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Итого:</span>
                    <span className="text-green-600">${totalAmount.toFixed(2)}</span>
                  </div>
                  
                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Оформить заказ
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Продолжить покупки
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
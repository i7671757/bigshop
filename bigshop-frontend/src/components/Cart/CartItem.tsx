'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, isUpdating, isRemoving } = useCart();
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  const { product } = item;
  
  if (!product) {
    return null; // Защита от некорректных данных
  }

  const price = parseFloat(product.price);
  const comparePrice = product.comparePrice ? parseFloat(product.comparePrice) : null;
  const totalPrice = price * item.quantity;
  const imageUrl = product.images[0] || '/placeholder-product.svg';

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setLocalQuantity(newQuantity);
    
    if (newQuantity === 0) {
      handleRemove();
    } else {
      updateQuantity({ itemId: item.id, quantity: newQuantity });
    }
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  const incrementQuantity = () => {
    if (localQuantity < product.inventory) {
      handleQuantityChange(localQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    handleQuantityChange(localQuantity - 1);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0"
    >
      {/* Product Image */}
      <div className="relative w-16 h-16 flex-shrink-0">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover rounded-lg"
          sizes="64px"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-product.svg';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">
          {product.name}
        </h3>
        
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-green-600 font-medium">
            ${price.toFixed(2)}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-sm text-gray-500 line-through">
              ${comparePrice.toFixed(2)}
            </span>
          )}
        </div>
        
        <div className="text-sm text-gray-600 mt-1">
          Всего: ${totalPrice.toFixed(2)}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <button
          onClick={decrementQuantity}
          disabled={isUpdating || localQuantity <= 1}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        
        <span className="w-8 text-center font-medium">
          {localQuantity}
        </span>
        
        <button
          onClick={incrementQuantity}
          disabled={isUpdating || localQuantity >= product.inventory}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
        title="Удалить из корзины"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Loading overlay */}
      {(isUpdating || isRemoving) && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </motion.div>
  );
}
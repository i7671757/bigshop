'use client';

import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  const { isSignedIn, user } = useUser();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Логотип */}
        <Link href="/" className="text-2xl font-bold text-green-600">
          BigShop
        </Link>

        {/* Навигация */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/products" className="text-gray-600 hover:text-gray-900">
            Продукты
          </Link>
          <Link
            href="/categories"
            className="text-gray-600 hover:text-gray-900">
            Категории
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-900">
            О нас
          </Link>
        </nav>

        {/* Корзина и профиль */}
        <div className="flex items-center space-x-4">
          {/* Корзина */}
          <Link href="/cart" className="relative">
            <svg
              className="w-6 h-6 text-gray-600 hover:text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5-5M7 13l-2.5 5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
          </Link>

          {/* Аутентификация */}
          {isSignedIn ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">
                Привет, {user?.firstName}!
              </span>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Войти
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}

import { SignedIn, SignedOut } from '@clerk/nextjs';
import Header from '@/components/Header';

export default function Home() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center py-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Добро пожаловать в <span className="text-green-600">BigShop</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Современный интернет-магазин продуктов питания с быстрой доставкой и широким ассортиментом
          </p>
          
          <SignedOut>
            <div className="space-x-4">
              <a
                href="/sign-up"
                className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors inline-block"
              >
                Начать покупки
              </a>
              <a
                href="/products"
                className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-50 transition-colors inline-block"
              >
                Посмотреть товары
              </a>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="space-x-4">
              <a
                href="/products"
                className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors inline-block"
              >
                Перейти к покупкам
              </a>
              <a
                href="/profile"
                className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-50 transition-colors inline-block"
              >
                Мой профиль
              </a>
            </div>
          </SignedIn>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Быстрая доставка</h3>
            <p className="text-gray-600">Доставляем продукты в течение 2-3 часов по всему городу</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Качество гарантировано</h3>
            <p className="text-gray-600">Только свежие и качественные продукты от проверенных поставщиков</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Выгодные цены</h3>
            <p className="text-gray-600">Конкурентные цены и регулярные акции на популярные товары</p>
          </div>
        </div>
      </main>
    </>
  );
}
